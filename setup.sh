#!/bin/bash
# Setup script for CryptoBot on Linux/Mac

echo ""
echo "================================"
echo "CryptoBot Setup for Linux/Mac"
echo "================================"
echo ""

# Create .env file
echo "Creating .env file..."
cat > .env << EOF
TELEGRAM_BOT_TOKEN=6905014359:AAEoEDNEgCl-5qRVc2srN8pTUrSnhEs09SA
DATABASE_PATH=data/crypto_bot.db
EOF

echo "[OK] .env file created"
echo ""

# Create data directory
if [ ! -d "data" ]; then
    mkdir -p data
    echo "[OK] Data directory created"
else
    echo "[OK] Data directory already exists"
fi
echo ""

echo "================================"
echo "Setup complete!"
echo "================================"
echo ""
echo "To start the bot:"
echo "  docker-compose up -d"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f"
echo ""
echo "To stop the bot:"
echo "  docker-compose down"
echo ""
