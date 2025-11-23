import { Context } from 'telegraf';
import { Database } from '../database/db';
import { SchemaManager } from '../database/schema-manager';

export class ButtonHandler {
  private db: Database;
  private schemaManager: SchemaManager;

  constructor(db: Database) {
    this.db = db;
    this.schemaManager = new SchemaManager(db);
  }

  async handleButton(ctx: Context): Promise<void> {
    if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) {
      return;
    }

    const userId = ctx.from?.id;
    if (!userId) {
      return;
    }

    try {
      const data = JSON.parse(ctx.callbackQuery.data);
      const { action, params } = data;

      await this.trackButtonClick(userId, action, params.category);

      switch (action) {
        case 'view_stats':
          await this.handleViewStats(ctx, params);
          break;
        case 'list_records':
          await this.handleListRecords(ctx, params, userId);
          break;
        case 'view_portfolio':
          await this.handleViewPortfolio(ctx, params, userId);
          break;
        default:
          await ctx.answerCbQuery('Функция в разработке');
      }
    } catch (error) {
      console.error('Error handling button:', error);
      await ctx.answerCbQuery('Произошла ошибка');
    }
  }

  private async trackButtonClick(
    userId: number,
    action: string,
    category: string
  ): Promise<void> {
    const result = await this.db.query(
      'SELECT * FROM users WHERE telegram_id = $1',
      [userId]
    );

    if (result.rows.length === 0) return;

    const dbUserId = result.rows[0].id;

    await this.db.query(
      `INSERT INTO user_patterns (user_id, action_type, category, button_action, count)
       VALUES ($1, 'button_click', $2, $3, 1)
       ON CONFLICT (user_id, action_type, button_action)
       DO UPDATE SET count = user_patterns.count + 1, last_used = CURRENT_TIMESTAMP`,
      [dbUserId, category, action]
    );
  }

  private async handleViewStats(ctx: Context, params: any): Promise<void> {
    await ctx.answerCbQuery();
    await ctx.reply(`Статистика для ${params.category}/${params.subcategory || 'all'} в разработке`);
  }

  private async handleListRecords(
    ctx: Context,
    params: any,
    userId: number
  ): Promise<void> {
    await ctx.answerCbQuery();

    const result = await this.db.query(
      'SELECT id FROM users WHERE telegram_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      await ctx.reply('Пользователь не найден');
      return;
    }

    const dbUserId = result.rows[0].id;
    const records = await this.schemaManager.queryData(
      params.category,
      params.subcategory || null,
      dbUserId,
      10
    );

    if (records.length === 0) {
      await ctx.reply('Записей пока нет');
      return;
    }

    const recordsText = records
      .map((r, i) => `${i + 1}. ${JSON.stringify(r, null, 2)}`)
      .join('\n\n');

    await ctx.reply(`Последние записи:\n\n${recordsText}`);
  }

  private async handleViewPortfolio(
    ctx: Context,
    params: any,
    userId: number
  ): Promise<void> {
    await ctx.answerCbQuery();
    await ctx.reply('Просмотр портфолио в разработке');
  }
}
