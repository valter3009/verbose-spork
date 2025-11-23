import logging
from typing import List, Callable
from src.services.database_service import DatabaseService
from src.services.crypto_service import CryptoService

logger = logging.getLogger(__name__)


class AlertService:
    """Service for managing price alerts"""

    def __init__(self, db_service: DatabaseService, crypto_service: CryptoService):
        self.db = db_service
        self.crypto = crypto_service

    def check_alerts(self, callback: Callable):
        """Check all active alerts and trigger notifications"""
        alerts = self.db.get_all_active_alerts()

        for user_id, alert in alerts:
            try:
                # Get current price
                price_data = self.crypto.get_price(alert['coin_id'])

                if not price_data:
                    continue

                current_price = price_data['price']
                target_price = alert['target_price']
                condition = alert['condition']

                # Check if alert condition is met
                triggered = False
                if condition == 'above' and current_price >= target_price:
                    triggered = True
                elif condition == 'below' and current_price <= target_price:
                    triggered = True

                if triggered:
                    # Trigger callback
                    callback(user_id, alert, current_price)

                    # Deactivate alert
                    self.db.deactivate_alert(alert['id'], user_id)

                    logger.info(f"Alert triggered for user {user_id}: {alert['coin_id']} {condition} {target_price}")

            except Exception as e:
                logger.error(f"Error checking alert {alert['id']}: {e}")
