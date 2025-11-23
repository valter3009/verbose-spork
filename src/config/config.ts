import dotenv from 'dotenv';

dotenv.config();

export const config = {
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
  },
  claude: {
    apiKey: process.env.CLAUDE_API_KEY || '',
    model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20240620',
  },
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/assistant_db',
  },
};

export function validateConfig(): void {
  if (!config.telegram.botToken) {
    throw new Error('TELEGRAM_BOT_TOKEN is required');
  }
  if (!config.claude.apiKey) {
    throw new Error('CLAUDE_API_KEY is required');
  }
  if (!config.database.url) {
    throw new Error('DATABASE_URL is required');
  }
}
