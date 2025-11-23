"""Formatting utilities for the crypto bot"""
from typing import Dict, List
from src.config.constants import EMOJI_CHART_UP, EMOJI_CHART_DOWN, EMOJI_FIRE, EMOJI_ROCKET


def format_price(price: float, currency: str = 'USD') -> str:
    """Format price with proper decimals"""
    if price >= 1:
        return f"${price:,.2f}" if currency.upper() == 'USD' else f"{price:,.2f} {currency.upper()}"
    elif price >= 0.01:
        return f"${price:.4f}" if currency.upper() == 'USD' else f"{price:.4f} {currency.upper()}"
    else:
        return f"${price:.8f}" if currency.upper() == 'USD' else f"{price:.8f} {currency.upper()}"


def format_large_number(num: float) -> str:
    """Format large numbers (market cap, volume)"""
    if num >= 1_000_000_000_000:
        return f"${num / 1_000_000_000_000:.2f}T"
    elif num >= 1_000_000_000:
        return f"${num / 1_000_000_000:.2f}B"
    elif num >= 1_000_000:
        return f"${num / 1_000_000:.2f}M"
    elif num >= 1_000:
        return f"${num / 1_000:.2f}K"
    else:
        return f"${num:.2f}"


def format_percentage(percentage: float) -> str:
    """Format percentage change with emoji"""
    emoji = EMOJI_CHART_UP if percentage >= 0 else EMOJI_CHART_DOWN
    sign = '+' if percentage >= 0 else ''
    return f"{emoji} {sign}{percentage:.2f}%"


def format_coin_price(data: Dict) -> str:
    """Format coin price data into a readable message"""
    coin_id = data['coin_id'].upper()
    price = format_price(data['price'], data['currency'])
    change = format_percentage(data['change_24h'])
    market_cap = format_large_number(data['market_cap'])
    volume = format_large_number(data['volume_24h'])

    message = f"""
💰 <b>{coin_id}</b>

Цена: <b>{price}</b>
Изменение 24ч: {change}
Капитализация: {market_cap}
Объем 24ч: {volume}
"""
    return message.strip()


def format_top_coins(coins: List[Dict]) -> str:
    """Format top coins list"""
    message = f"{EMOJI_FIRE} <b>Топ Криптовалют</b>\n\n"

    for coin in coins:
        rank_emoji = {1: '🥇', 2: '🥈', 3: '🥉'}.get(coin['rank'], f"{coin['rank']}.")
        price = format_price(coin['price'])
        change = format_percentage(coin['change_24h'])

        message += f"{rank_emoji} <b>{coin['symbol']}</b> - {coin['name']}\n"
        message += f"   {price} {change}\n\n"

    return message.strip()


def format_trending_coins(coins: List[Dict]) -> str:
    """Format trending coins list"""
    message = f"{EMOJI_ROCKET} <b>Трендовые Криптовалюты</b>\n\n"

    for coin in coins:
        message += f"{coin['rank']}. <b>{coin['symbol']}</b> - {coin['name']}\n"
        if coin['market_cap_rank'] != 'N/A':
            message += f"   Место: #{coin['market_cap_rank']}\n"
        message += "\n"

    return message.strip()


def format_portfolio(portfolio: List[Dict], prices: Dict) -> str:
    """Format portfolio with current values"""
    if not portfolio:
        return "Ваше портфолио пусто. Используйте /portfolio add [монета] [количество] [цена] для добавления."

    message = "💼 <b>Ваше Портфолио</b>\n\n"
    total_value = 0
    total_invested = 0

    for item in portfolio:
        coin_id = item['coin_id']
        amount = item['amount']
        purchase_price = item['purchase_price']

        current_price_data = prices.get(coin_id)
        if current_price_data:
            current_price = current_price_data['price']
            current_value = amount * current_price
            invested = amount * purchase_price
            profit_loss = current_value - invested
            profit_loss_pct = (profit_loss / invested * 100) if invested > 0 else 0

            total_value += current_value
            total_invested += invested

            pl_emoji = EMOJI_CHART_UP if profit_loss >= 0 else EMOJI_CHART_DOWN
            pl_sign = '+' if profit_loss >= 0 else ''

            message += f"<b>{coin_id.upper()}</b>\n"
            message += f"  Количество: {amount:.8f}\n"
            message += f"  Цена покупки: {format_price(purchase_price)}\n"
            message += f"  Текущая цена: {format_price(current_price)}\n"
            message += f"  Стоимость: {format_price(current_value)}\n"
            message += f"  Прибыль/Убыток: {pl_emoji} {pl_sign}{format_price(profit_loss)} ({pl_sign}{profit_loss_pct:.2f}%)\n\n"

    if total_invested > 0:
        total_pl = total_value - total_invested
        total_pl_pct = (total_pl / total_invested * 100)
        pl_emoji = EMOJI_CHART_UP if total_pl >= 0 else EMOJI_CHART_DOWN

        message += "─" * 30 + "\n"
        message += f"<b>Всего вложено:</b> {format_price(total_invested)}\n"
        message += f"<b>Текущая стоимость:</b> {format_price(total_value)}\n"
        message += f"<b>Прибыль/Убыток:</b> {pl_emoji} {format_price(total_pl)} ({total_pl_pct:+.2f}%)"

    return message


def format_alerts(alerts: List[Dict]) -> str:
    """Format alerts list"""
    if not alerts:
        return "У вас нет активных алертов. Используйте /alert для создания."

    message = "🔔 <b>Ваши Ценовые Алерты</b>\n\n"

    for alert in alerts:
        coin = alert['coin_id'].upper()
        price = format_price(alert['target_price'])
        condition = alert['condition']
        condition_ru = 'выше' if condition == 'above' else 'ниже'

        message += f"<b>{coin}</b> {condition_ru} {price}\n"
        message += f"  ID: {alert['id']}\n\n"

    message += "\nИспользуйте /alert remove [id] для удаления алерта"

    return message


def format_conversion(data: Dict) -> str:
    """Format currency conversion result"""
    from_coin = data['from_coin'].upper()
    to_coin = data['to_coin'].upper()
    from_amount = data['from_amount']
    to_amount = data['to_amount']

    message = f"""
💱 <b>Результат Конвертации</b>

{from_amount:.8f} {from_coin}
=
{to_amount:.8f} {to_coin}

<i>1 {from_coin} = {to_amount / from_amount:.8f} {to_coin}</i>
"""
    return message.strip()


def create_simple_chart(prices: List, width: int = 20) -> str:
    """Create a simple ASCII chart"""
    if not prices:
        return ""

    # Extract just the price values
    values = [p[1] for p in prices]

    if not values:
        return ""

    min_val = min(values)
    max_val = max(values)
    value_range = max_val - min_val

    if value_range == 0:
        return "─" * width

    # Create chart
    chart = ""
    height = 8
    bars = "▁▂▃▄▅▆▇█"

    # Sample data points to fit width
    step = max(1, len(values) // width)
    sampled = values[::step][:width]

    for val in sampled:
        normalized = (val - min_val) / value_range
        bar_idx = min(len(bars) - 1, int(normalized * (len(bars) - 1)))
        chart += bars[bar_idx]

    return chart
