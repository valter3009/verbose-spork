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
🚀 <b>Welcome to CryptoBot!</b>

Your ultimate companion for cryptocurrency tracking and portfolio management.

<b>Available commands:</b>
/price [coin] - Get current price
/top - Top 10 cryptocurrencies
/portfolio - Manage your portfolio
/alert - Set price alerts
/convert - Convert between cryptocurrencies
/trending - Trending coins
/info - Detailed coin information
/chart - Price charts
/help - Show this help message

<b>Example:</b> /price bitcoin
"""

HELP_MESSAGE = WELCOME_MESSAGE
