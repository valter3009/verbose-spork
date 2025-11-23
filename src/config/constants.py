"""Constants for the crypto bot"""

# Popular cryptocurrencies
POPULAR_CRYPTOS = [
    'bitcoin', 'ethereum', 'binancecoin', 'cardano', 'solana',
    'ripple', 'polkadot', 'dogecoin', 'avalanche-2', 'polygon'
]

# Crypto symbols mapping
CRYPTO_SYMBOLS = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'BNB': 'binancecoin',
    'ADA': 'cardano',
    'SOL': 'solana',
    'XRP': 'ripple',
    'DOT': 'polkadot',
    'DOGE': 'dogecoin',
    'AVAX': 'avalanche-2',
    'MATIC': 'polygon',
    'USDT': 'tether',
    'USDC': 'usd-coin',
    'TON': 'the-open-network',
    'LINK': 'chainlink',
    'UNI': 'uniswap',
}

# Fiat currencies
SUPPORTED_CURRENCIES = ['usd', 'eur', 'gbp', 'jpy', 'cny', 'rub', 'krw']

# Emojis
EMOJI_CHART_UP = '📈'
EMOJI_CHART_DOWN = '📉'
EMOJI_MONEY = '💰'
EMOJI_BELL = '🔔'
EMOJI_FIRE = '🔥'
EMOJI_ROCKET = '🚀'
EMOJI_DIAMOND = '💎'
EMOJI_WARNING = '⚠️'
EMOJI_CHECK = '✅'
EMOJI_CROSS = '❌'

# Messages
WELCOME_MESSAGE = """
🚀 <b>Добро пожаловать в CryptoBot!</b>

Ваш надежный помощник для отслеживания криптовалют и управления портфолио.

<b>Доступные команды:</b>
/price [монета] - Узнать текущую цену
/top - Топ 10 криптовалют
/portfolio - Управление портфолио
/alert - Настроить ценовые алерты
/convert - Конвертация валют
/trending - Трендовые монеты
/info - Подробная информация о монете
/chart - График цены
/help - Показать эту справку

<b>Пример:</b> /price bitcoin
"""

HELP_MESSAGE = WELCOME_MESSAGE
