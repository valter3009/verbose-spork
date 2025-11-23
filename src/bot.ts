import { Telegraf } from 'telegraf';
import { config, validateConfig } from '../config/config';
import { Database } from './database/db';
import { MessageHandler } from './handlers/message-handler';
import { ButtonHandler } from './handlers/button-handler';

async function main() {
  try {
    validateConfig();

    const db = new Database();
    await db.connect();

    const bot = new Telegraf(config.telegram.botToken);

    const messageHandler = new MessageHandler(db);
    const buttonHandler = new ButtonHandler(db);

    bot.start((ctx) => {
      ctx.reply(
        'Привет! Я универсальный ИИ-ассистент. Расскажи мне о чем угодно, и я помогу организовать информацию.\n\n' +
        'Например:\n' +
        '- "Сегодня пробежал 5км за 28 минут"\n' +
        '- "Купил 1 BTC за 88000"\n' +
        '- "Идея для стартапа: AI помощник для садоводов"\n\n' +
        'Я автоматически создам подходящие структуры для хранения и анализа данных.'
      );
    });

    bot.on('text', async (ctx) => {
      await messageHandler.handleMessage(ctx);
    });

    bot.on('callback_query', async (ctx) => {
      await buttonHandler.handleButton(ctx);
    });

    bot.launch();
    console.log('Bot started successfully');

    process.once('SIGINT', () => {
      bot.stop('SIGINT');
      db.close();
    });
    process.once('SIGTERM', () => {
      bot.stop('SIGTERM');
      db.close();
    });
  } catch (error) {
    console.error('Failed to start bot:', error);
    process.exit(1);
  }
}

main();
