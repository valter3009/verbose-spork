"""Command handlers for the crypto bot"""
import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes
from src.services.database_service import DatabaseService
from src.services.crypto_service import CryptoService
from src.utils.formatters import (
    format_coin_price, format_top_coins, format_trending_coins,
    format_portfolio, format_alerts, format_conversion, create_simple_chart
)
from src.config.constants import WELCOME_MESSAGE, HELP_MESSAGE, CRYPTO_SYMBOLS

logger = logging.getLogger(__name__)


class CommandHandlers:
    """Handlers for bot commands"""

    def __init__(self, db_service: DatabaseService, crypto_service: CryptoService):
        self.db = db_service
        self.crypto = crypto_service

    async def start_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /start command"""
        user = update.effective_user

        # Add user to database
        self.db.add_user(
            user_id=user.id,
            username=user.username,
            first_name=user.first_name,
            last_name=user.last_name
        )

        await update.message.reply_text(
            WELCOME_MESSAGE,
            parse_mode='HTML'
        )

    async def help_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /help command"""
        await update.message.reply_text(
            HELP_MESSAGE,
            parse_mode='HTML'
        )

    async def price_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /price command"""
        if not context.args:
            await update.message.reply_text(
                "Please specify a cryptocurrency.\n"
                "Example: /price bitcoin or /price BTC"
            )
            return

        coin_input = ' '.join(context.args)
        coin_id = self.crypto.normalize_coin_id(coin_input)

        # Show typing indicator
        await context.bot.send_chat_action(
            chat_id=update.effective_chat.id,
            action='typing'
        )

        price_data = self.crypto.get_price(coin_id)

        if not price_data:
            await update.message.reply_text(
                f"Could not find cryptocurrency: {coin_input}\n"
                "Please check the name and try again."
            )
            return

        message = format_coin_price(price_data)
        await update.message.reply_text(message, parse_mode='HTML')

    async def top_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /top command"""
        await context.bot.send_chat_action(
            chat_id=update.effective_chat.id,
            action='typing'
        )

        limit = 10
        if context.args and context.args[0].isdigit():
            limit = min(int(context.args[0]), 50)

        coins = self.crypto.get_top_coins(limit=limit)

        if not coins:
            await update.message.reply_text("Could not fetch top cryptocurrencies.")
            return

        message = format_top_coins(coins)
        await update.message.reply_text(message, parse_mode='HTML')

    async def trending_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /trending command"""
        await context.bot.send_chat_action(
            chat_id=update.effective_chat.id,
            action='typing'
        )

        coins = self.crypto.get_trending_coins()

        if not coins:
            await update.message.reply_text("Could not fetch trending cryptocurrencies.")
            return

        message = format_trending_coins(coins)
        await update.message.reply_text(message, parse_mode='HTML')

    async def portfolio_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /portfolio command"""
        user_id = update.effective_user.id

        if not context.args:
            # Show portfolio
            portfolio = self.db.get_portfolio(user_id)

            # Fetch current prices
            prices = {}
            for item in portfolio:
                price_data = self.crypto.get_price(item['coin_id'])
                if price_data:
                    prices[item['coin_id']] = price_data

            message = format_portfolio(portfolio, prices)
            await update.message.reply_text(message, parse_mode='HTML')
            return

        action = context.args[0].lower()

        if action == 'add':
            # Add to portfolio: /portfolio add <coin> <amount> <price>
            if len(context.args) < 4:
                await update.message.reply_text(
                    "Usage: /portfolio add <coin> <amount> <purchase_price>\n"
                    "Example: /portfolio add bitcoin 0.5 30000"
                )
                return

            coin_input = context.args[1]
            coin_id = self.crypto.normalize_coin_id(coin_input)

            try:
                amount = float(context.args[2])
                purchase_price = float(context.args[3])

                self.db.add_portfolio_item(user_id, coin_id, amount, purchase_price)
                await update.message.reply_text(
                    f"✅ Added {amount} {coin_id.upper()} to your portfolio!"
                )

            except ValueError:
                await update.message.reply_text("Invalid amount or price. Please use numbers.")

        elif action == 'remove':
            # Remove from portfolio: /portfolio remove <id>
            if len(context.args) < 2:
                await update.message.reply_text(
                    "Usage: /portfolio remove <id>\n"
                    "Get the ID from /portfolio command"
                )
                return

            try:
                item_id = int(context.args[1])
                if self.db.remove_portfolio_item(item_id, user_id):
                    await update.message.reply_text("✅ Removed from portfolio!")
                else:
                    await update.message.reply_text("Item not found in your portfolio.")

            except ValueError:
                await update.message.reply_text("Invalid ID. Please use a number.")

        elif action == 'clear':
            # Clear portfolio
            self.db.clear_portfolio(user_id)
            await update.message.reply_text("✅ Portfolio cleared!")

        else:
            await update.message.reply_text(
                "Unknown action. Use: add, remove, or clear"
            )

    async def alert_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /alert command"""
        user_id = update.effective_user.id

        if not context.args:
            # Show alerts
            alerts = self.db.get_alerts(user_id)
            message = format_alerts(alerts)
            await update.message.reply_text(message, parse_mode='HTML')
            return

        action = context.args[0].lower()

        if action == 'add':
            # Add alert: /alert add <coin> <above|below> <price>
            if len(context.args) < 4:
                await update.message.reply_text(
                    "Usage: /alert add <coin> <above|below> <price>\n"
                    "Example: /alert add bitcoin above 50000"
                )
                return

            coin_input = context.args[1]
            coin_id = self.crypto.normalize_coin_id(coin_input)
            condition = context.args[2].lower()

            if condition not in ['above', 'below']:
                await update.message.reply_text("Condition must be 'above' or 'below'")
                return

            try:
                target_price = float(context.args[3])
                self.db.add_alert(user_id, coin_id, target_price, condition)
                await update.message.reply_text(
                    f"🔔 Alert set! You'll be notified when {coin_id.upper()} goes {condition} ${target_price:,.2f}"
                )

            except ValueError:
                await update.message.reply_text("Invalid price. Please use a number.")

        elif action == 'remove':
            # Remove alert: /alert remove <id>
            if len(context.args) < 2:
                await update.message.reply_text(
                    "Usage: /alert remove <id>\n"
                    "Get the ID from /alert command"
                )
                return

            try:
                alert_id = int(context.args[1])
                if self.db.remove_alert(alert_id, user_id):
                    await update.message.reply_text("✅ Alert removed!")
                else:
                    await update.message.reply_text("Alert not found.")

            except ValueError:
                await update.message.reply_text("Invalid ID. Please use a number.")

        else:
            await update.message.reply_text(
                "Unknown action. Use: add or remove"
            )

    async def convert_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /convert command"""
        if len(context.args) < 3:
            await update.message.reply_text(
                "Usage: /convert <amount> <from_coin> <to_coin>\n"
                "Example: /convert 1 bitcoin ethereum"
            )
            return

        try:
            amount = float(context.args[0])
            from_coin = self.crypto.normalize_coin_id(context.args[1])
            to_coin = self.crypto.normalize_coin_id(context.args[2])

            await context.bot.send_chat_action(
                chat_id=update.effective_chat.id,
                action='typing'
            )

            result = self.crypto.convert_crypto(from_coin, to_coin, amount)

            if not result:
                await update.message.reply_text(
                    "Could not perform conversion. Please check the coin names."
                )
                return

            message = format_conversion(result)
            await update.message.reply_text(message, parse_mode='HTML')

        except ValueError:
            await update.message.reply_text("Invalid amount. Please use a number.")

    async def chart_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /chart command"""
        if not context.args:
            await update.message.reply_text(
                "Usage: /chart <coin> [days]\n"
                "Example: /chart bitcoin 7"
            )
            return

        coin_input = context.args[0]
        coin_id = self.crypto.normalize_coin_id(coin_input)

        days = 7
        if len(context.args) > 1 and context.args[1].isdigit():
            days = min(int(context.args[1]), 365)

        await context.bot.send_chat_action(
            chat_id=update.effective_chat.id,
            action='typing'
        )

        prices = self.crypto.get_price_history(coin_id, days=days)

        if not prices:
            await update.message.reply_text(
                f"Could not fetch price history for {coin_input}"
            )
            return

        # Get current price
        current_data = self.crypto.get_price(coin_id)
        if not current_data:
            return

        chart = create_simple_chart(prices, width=30)

        # Calculate change
        first_price = prices[0][1]
        last_price = prices[-1][1]
        change = ((last_price - first_price) / first_price) * 100

        message = f"""
📊 <b>{coin_id.upper()}</b> - {days} Day Chart

{chart}

Period Change: {change:+.2f}%
Current Price: ${current_data['price']:,.2f}
"""
        await update.message.reply_text(message.strip(), parse_mode='HTML')

    async def info_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /info command"""
        if not context.args:
            await update.message.reply_text(
                "Usage: /info <coin>\n"
                "Example: /info bitcoin"
            )
            return

        coin_input = ' '.join(context.args)
        coin_id = self.crypto.normalize_coin_id(coin_input)

        await context.bot.send_chat_action(
            chat_id=update.effective_chat.id,
            action='typing'
        )

        info = self.crypto.get_coin_info(coin_id)

        if not info:
            await update.message.reply_text(
                f"Could not find information for {coin_input}"
            )
            return

        message = f"""
<b>{info['name']} ({info['symbol']})</b>

Market Cap Rank: #{info['market_cap_rank']}

{info['description'][:300]}...

🌐 Website: {info['homepage']}
"""
        await update.message.reply_text(message.strip(), parse_mode='HTML')
