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
                "Пожалуйста, укажите криптовалюту.\n"
                "Пример: /price bitcoin или /price BTC"
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
                f"Не удалось найти криптовалюту: {coin_input}\n"
                "Проверьте название и попробуйте снова."
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
            await update.message.reply_text("Не удалось получить топ криптовалют.")
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
            await update.message.reply_text("Не удалось получить трендовые криптовалюты.")
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
                    "Использование: /portfolio add [монета] [количество] [цена_покупки]\n"
                    "Пример: /portfolio add bitcoin 0.5 30000"
                )
                return

            coin_input = context.args[1]
            coin_id = self.crypto.normalize_coin_id(coin_input)

            try:
                amount = float(context.args[2])
                purchase_price = float(context.args[3])

                self.db.add_portfolio_item(user_id, coin_id, amount, purchase_price)
                await update.message.reply_text(
                    f"✅ Добавлено {amount} {coin_id.upper()} в ваше портфолио!"
                )

            except ValueError:
                await update.message.reply_text("Неверное количество или цена. Используйте числа.")

        elif action == 'remove':
            # Remove from portfolio: /portfolio remove <id>
            if len(context.args) < 2:
                await update.message.reply_text(
                    "Использование: /portfolio remove [id]\n"
                    "Получите ID из команды /portfolio"
                )
                return

            try:
                item_id = int(context.args[1])
                if self.db.remove_portfolio_item(item_id, user_id):
                    await update.message.reply_text("✅ Удалено из портфолио!")
                else:
                    await update.message.reply_text("Позиция не найдена в вашем портфолио.")

            except ValueError:
                await update.message.reply_text("Неверный ID. Используйте число.")

        elif action == 'clear':
            # Clear portfolio
            self.db.clear_portfolio(user_id)
            await update.message.reply_text("✅ Портфолио очищено!")

        else:
            await update.message.reply_text(
                "Неизвестное действие. Используйте: add, remove или clear"
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
                    "Использование: /alert add [монета] [above|below] [цена]\n"
                    "Пример: /alert add bitcoin above 50000\n"
                    "above = выше, below = ниже"
                )
                return

            coin_input = context.args[1]
            coin_id = self.crypto.normalize_coin_id(coin_input)
            condition = context.args[2].lower()

            if condition not in ['above', 'below', 'выше', 'ниже']:
                await update.message.reply_text("Условие должно быть 'above' (выше) или 'below' (ниже)")
                return

            # Translate Russian to English
            if condition == 'выше':
                condition = 'above'
            elif condition == 'ниже':
                condition = 'below'

            try:
                target_price = float(context.args[3])
                self.db.add_alert(user_id, coin_id, target_price, condition)
                condition_ru = 'выше' if condition == 'above' else 'ниже'
                await update.message.reply_text(
                    f"🔔 Алерт установлен! Вы получите уведомление когда {coin_id.upper()} будет {condition_ru} ${target_price:,.2f}"
                )

            except ValueError:
                await update.message.reply_text("Неверная цена. Используйте число.")

        elif action == 'remove':
            # Remove alert: /alert remove <id>
            if len(context.args) < 2:
                await update.message.reply_text(
                    "Использование: /alert remove [id]\n"
                    "Получите ID из команды /alert"
                )
                return

            try:
                alert_id = int(context.args[1])
                if self.db.remove_alert(alert_id, user_id):
                    await update.message.reply_text("✅ Алерт удален!")
                else:
                    await update.message.reply_text("Алерт не найден.")

            except ValueError:
                await update.message.reply_text("Неверный ID. Используйте число.")

        else:
            await update.message.reply_text(
                "Неизвестное действие. Используйте: add или remove"
            )

    async def convert_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /convert command"""
        if len(context.args) < 3:
            await update.message.reply_text(
                "Использование: /convert [количество] [из_монеты] [в_монету]\n"
                "Пример: /convert 1 bitcoin ethereum"
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
                    "Не удалось выполнить конвертацию. Проверьте названия монет."
                )
                return

            message = format_conversion(result)
            await update.message.reply_text(message, parse_mode='HTML')

        except ValueError:
            await update.message.reply_text("Неверное количество. Используйте число.")

    async def chart_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /chart command"""
        if not context.args:
            await update.message.reply_text(
                "Использование: /chart [монета] [дней]\n"
                "Пример: /chart bitcoin 7"
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
                f"Не удалось получить историю цен для {coin_input}"
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
📊 <b>{coin_id.upper()}</b> - График за {days} дней

{chart}

Изменение: {change:+.2f}%
Текущая цена: ${current_data['price']:,.2f}
"""
        await update.message.reply_text(message.strip(), parse_mode='HTML')

    async def info_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /info command"""
        if not context.args:
            await update.message.reply_text(
                "Использование: /info [монета]\n"
                "Пример: /info bitcoin"
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
                f"Не удалось найти информацию о {coin_input}"
            )
            return

        message = f"""
<b>{info['name']} ({info['symbol']})</b>

Место по капитализации: #{info['market_cap_rank']}

{info['description'][:300]}...

🌐 Сайт: {info['homepage']}
"""
        await update.message.reply_text(message.strip(), parse_mode='HTML')
