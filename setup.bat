@echo off
REM Setup script for CryptoBot on Windows

echo.
echo ================================
echo CryptoBot Setup for Windows
echo ================================
echo.

REM Create .env file
echo Creating .env file...
(
echo TELEGRAM_BOT_TOKEN=6905014359:AAEoEDNEgCl-5qRVc2srN8pTUrSnhEs09SA
echo DATABASE_PATH=data/crypto_bot.db
) > .env

echo [OK] .env file created
echo.

REM Create data directory
if not exist "data" (
    mkdir data
    echo [OK] Data directory created
) else (
    echo [OK] Data directory already exists
)
echo.

echo ================================
echo Setup complete!
echo ================================
echo.
echo To start the bot:
echo   docker-compose up -d
echo.
echo To view logs:
echo   docker-compose logs -f
echo.
echo To stop the bot:
echo   docker-compose down
echo.
pause
