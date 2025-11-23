import logging
import requests
from typing import Dict, List, Optional
from pycoingecko import CoinGeckoAPI
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class CryptoService:
    """Service for cryptocurrency data operations"""

    def __init__(self):
        self.cg = CoinGeckoAPI()
        self._price_cache = {}
        self._cache_timestamp = {}

    def _is_cache_valid(self, key: str, duration: int = 60) -> bool:
        """Check if cache is still valid"""
        if key not in self._cache_timestamp:
            return False
        return (datetime.now() - self._cache_timestamp[key]).seconds < duration

    def _get_cached_price(self, coin_id: str) -> Optional[Dict]:
        """Get price from cache if valid"""
        if self._is_cache_valid(coin_id):
            return self._price_cache.get(coin_id)
        return None

    def _cache_price(self, coin_id: str, data: Dict):
        """Cache price data"""
        self._price_cache[coin_id] = data
        self._cache_timestamp[coin_id] = datetime.now()

    def normalize_coin_id(self, coin_input: str) -> str:
        """Normalize coin input to CoinGecko ID"""
        from src.config.constants import CRYPTO_SYMBOLS

        coin_input = coin_input.lower().strip()

        # Check if it's a symbol
        if coin_input.upper() in CRYPTO_SYMBOLS:
            return CRYPTO_SYMBOLS[coin_input.upper()]

        return coin_input

    def get_price(self, coin_id: str, currency: str = 'usd') -> Optional[Dict]:
        """Get current price for a cryptocurrency"""
        try:
            # Check cache first
            cached = self._get_cached_price(f"{coin_id}_{currency}")
            if cached:
                return cached

            # Fetch from API
            data = self.cg.get_price(
                ids=coin_id,
                vs_currencies=currency,
                include_24hr_change=True,
                include_market_cap=True,
                include_24hr_vol=True
            )

            if coin_id not in data:
                return None

            result = {
                'coin_id': coin_id,
                'currency': currency,
                'price': data[coin_id][currency],
                'change_24h': data[coin_id].get(f'{currency}_24h_change', 0),
                'market_cap': data[coin_id].get(f'{currency}_market_cap', 0),
                'volume_24h': data[coin_id].get(f'{currency}_24h_vol', 0),
                'timestamp': datetime.now().isoformat()
            }

            # Cache the result
            self._cache_price(f"{coin_id}_{currency}", result)

            return result

        except Exception as e:
            logger.error(f"Error fetching price for {coin_id}: {e}")
            return None

    def get_coin_info(self, coin_id: str) -> Optional[Dict]:
        """Get detailed coin information"""
        try:
            data = self.cg.get_coin_by_id(
                id=coin_id,
                localization=False,
                tickers=False,
                community_data=False,
                developer_data=False
            )

            return {
                'id': data['id'],
                'symbol': data['symbol'].upper(),
                'name': data['name'],
                'description': data.get('description', {}).get('en', '')[:500],
                'market_cap_rank': data.get('market_cap_rank', 'N/A'),
                'image': data.get('image', {}).get('large', ''),
                'homepage': data.get('links', {}).get('homepage', [''])[0]
            }

        except Exception as e:
            logger.error(f"Error fetching coin info for {coin_id}: {e}")
            return None

    def get_top_coins(self, limit: int = 10, currency: str = 'usd') -> List[Dict]:
        """Get top cryptocurrencies by market cap"""
        try:
            data = self.cg.get_coins_markets(
                vs_currency=currency,
                order='market_cap_desc',
                per_page=limit,
                page=1,
                price_change_percentage='24h'
            )

            return [
                {
                    'rank': idx + 1,
                    'id': coin['id'],
                    'symbol': coin['symbol'].upper(),
                    'name': coin['name'],
                    'price': coin['current_price'],
                    'change_24h': coin.get('price_change_percentage_24h', 0),
                    'market_cap': coin.get('market_cap', 0),
                    'volume': coin.get('total_volume', 0)
                }
                for idx, coin in enumerate(data)
            ]

        except Exception as e:
            logger.error(f"Error fetching top coins: {e}")
            return []

    def get_trending_coins(self) -> List[Dict]:
        """Get trending coins"""
        try:
            data = self.cg.get_search_trending()
            coins = data.get('coins', [])

            return [
                {
                    'rank': idx + 1,
                    'id': coin['item']['id'],
                    'symbol': coin['item']['symbol'].upper(),
                    'name': coin['item']['name'],
                    'market_cap_rank': coin['item'].get('market_cap_rank', 'N/A'),
                    'score': coin['item'].get('score', 0)
                }
                for idx, coin in enumerate(coins[:10])
            ]

        except Exception as e:
            logger.error(f"Error fetching trending coins: {e}")
            return []

    def convert_crypto(self, from_coin: str, to_coin: str, amount: float) -> Optional[Dict]:
        """Convert between cryptocurrencies"""
        try:
            # Get prices in USD
            from_price_data = self.get_price(from_coin, 'usd')
            to_price_data = self.get_price(to_coin, 'usd')

            if not from_price_data or not to_price_data:
                return None

            from_price = from_price_data['price']
            to_price = to_price_data['price']

            # Calculate conversion
            usd_value = amount * from_price
            to_amount = usd_value / to_price

            return {
                'from_coin': from_coin,
                'to_coin': to_coin,
                'from_amount': amount,
                'to_amount': to_amount,
                'from_price': from_price,
                'to_price': to_price,
                'usd_value': usd_value
            }

        except Exception as e:
            logger.error(f"Error converting {from_coin} to {to_coin}: {e}")
            return None

    def search_coins(self, query: str) -> List[Dict]:
        """Search for coins by name or symbol"""
        try:
            data = self.cg.search(query)
            coins = data.get('coins', [])

            return [
                {
                    'id': coin['id'],
                    'symbol': coin['symbol'].upper(),
                    'name': coin['name'],
                    'market_cap_rank': coin.get('market_cap_rank', 'N/A')
                }
                for coin in coins[:10]
            ]

        except Exception as e:
            logger.error(f"Error searching coins: {e}")
            return []

    def get_price_history(self, coin_id: str, days: int = 7, currency: str = 'usd') -> Optional[List]:
        """Get historical price data"""
        try:
            data = self.cg.get_coin_market_chart_by_id(
                id=coin_id,
                vs_currency=currency,
                days=days
            )

            prices = data.get('prices', [])
            return prices

        except Exception as e:
            logger.error(f"Error fetching price history for {coin_id}: {e}")
            return None
