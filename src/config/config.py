import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Bot configuration settings"""

    # Telegram Bot Token
    BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN', '6905014359:AAEoEDNEgCl-5qRVc2srN8pTUrSnhEs09SA')

    # Database
    DATABASE_PATH = os.getenv('DATABASE_PATH', 'data/crypto_bot.db')

    # API Settings
    COINGECKO_API_URL = 'https://api.coingecko.com/api/v3'
    REQUEST_TIMEOUT = 10

    # Cache settings
    PRICE_CACHE_DURATION = 60  # seconds

    # Alert settings
    ALERT_CHECK_INTERVAL = 300  # 5 minutes

    # Bot settings
    MAX_PORTFOLIO_ITEMS = 50
    MAX_ALERTS_PER_USER = 20

    # Pagination
    ITEMS_PER_PAGE = 10

    @staticmethod
    def validate():
        """Validate required configuration"""
        if not Config.BOT_TOKEN:
            raise ValueError("TELEGRAM_BOT_TOKEN is required")
        return True
