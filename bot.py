#!/usr/bin/env python3
"""
CryptoBot - Advanced Telegram Bot for Cryptocurrency Tracking
Supports price tracking, portfolio management, alerts, and more.
"""
import logging
import sys
from telegram import Update
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    filters,
    ContextTypes
)
from apscheduler.schedulers.background import BackgroundScheduler

# Add src to path
sys.path.insert(0, '/app')

from src.config.config import Config
from src.services.database_service import DatabaseService
from src.services.crypto_service import CryptoService
from src.services.alert_service import AlertService
from src.handlers.commands import CommandHandlers

# Configure logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)


class CryptoBot:
    """Main bot class"""

    def __init__(self):
        # Validate config
        Config.validate()

        # Initialize services
        self.db_service = DatabaseService(Config.DATABASE_PATH)
        self.crypto_service = CryptoService()
        self.alert_service = AlertService(self.db_service, self.crypto_service)

        # Initialize handlers
        self.handlers = CommandHandlers(self.db_service, self.crypto_service)

        # Initialize bot application
        self.application = Application.builder().token(Config.BOT_TOKEN).build()

        # Initialize scheduler for alerts
        self.scheduler = BackgroundScheduler()

        # Setup
        self._register_handlers()
        self._setup_alert_scheduler()

    def _register_handlers(self):
        """Register command handlers"""
        # Command handlers
        self.application.add_handler(CommandHandler("start", self.handlers.start_command))
        self.application.add_handler(CommandHandler("help", self.handlers.help_command))
        self.application.add_handler(CommandHandler("price", self.handlers.price_command))
        self.application.add_handler(CommandHandler("top", self.handlers.top_command))
        self.application.add_handler(CommandHandler("trending", self.handlers.trending_command))
        self.application.add_handler(CommandHandler("portfolio", self.handlers.portfolio_command))
        self.application.add_handler(CommandHandler("alert", self.handlers.alert_command))
        self.application.add_handler(CommandHandler("convert", self.handlers.convert_command))
        self.application.add_handler(CommandHandler("chart", self.handlers.chart_command))
        self.application.add_handler(CommandHandler("info", self.handlers.info_command))

        # Error handler
        self.application.add_error_handler(self._error_handler)

        logger.info("Handlers registered successfully")

    def _setup_alert_scheduler(self):
        """Setup scheduler for checking alerts"""
        self.scheduler.add_job(
            self._check_alerts,
            'interval',
            seconds=Config.ALERT_CHECK_INTERVAL,
            id='alert_checker'
        )
        logger.info("Alert scheduler configured")

    def _check_alerts(self):
        """Check all alerts and send notifications"""
        try:
            def send_alert_notification(user_id: int, alert: dict, current_price: float):
                """Send alert notification to user"""
                import asyncio

                async def send_message():
                    condition_ru = 'выше' if alert['condition'] == 'above' else 'ниже'
                    message = f"""
🔔 <b>Сработал Ценовой Алерт!</b>

{alert['coin_id'].upper()} теперь {condition_ru} ${alert['target_price']:,.2f}

Текущая цена: ${current_price:,.2f}
"""
                    try:
                        await self.application.bot.send_message(
                            chat_id=user_id,
                            text=message.strip(),
                            parse_mode='HTML'
                        )
                    except Exception as e:
                        logger.error(f"Error sending alert to user {user_id}: {e}")

                # Run async task
                try:
                    loop = asyncio.get_event_loop()
                    if loop.is_running():
                        asyncio.create_task(send_message())
                    else:
                        loop.run_until_complete(send_message())
                except RuntimeError:
                    # Create new event loop if none exists
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)
                    loop.run_until_complete(send_message())

            self.alert_service.check_alerts(send_alert_notification)

        except Exception as e:
            logger.error(f"Error checking alerts: {e}")

    async def _error_handler(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle errors"""
        logger.error(f"Update {update} caused error {context.error}")

        if update and update.effective_message:
            await update.effective_message.reply_text(
                "Произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте снова."
            )

    def run(self):
        """Run the bot"""
        logger.info("Starting CryptoBot...")

        # Start scheduler
        self.scheduler.start()
        logger.info("Alert scheduler started")

        # Start bot
        logger.info("Bot is running. Press Ctrl+C to stop.")
        self.application.run_polling(allowed_updates=Update.ALL_TYPES)


def main():
    """Main entry point"""
    try:
        bot = CryptoBot()
        bot.run()
    except KeyboardInterrupt:
        logger.info("Bot stopped by user")
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
