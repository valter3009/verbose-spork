import { Context } from 'telegraf';
import { ClaudeService } from '../claude';
import { SchemaManager } from '../database/schema-manager';
import { Database } from '../database/db';
import { ClaudeResponse } from '../types/claude-response';

export class MessageHandler {
  private claudeService: ClaudeService;
  private schemaManager: SchemaManager;
  private db: Database;

  constructor(db: Database) {
    this.db = db;
    this.claudeService = new ClaudeService();
    this.schemaManager = new SchemaManager(db);
  }

  async handleMessage(ctx: Context): Promise<void> {
    if (!ctx.message || !('text' in ctx.message)) {
      return;
    }

    const userId = ctx.from?.id;
    if (!userId) {
      return;
    }

    const userMessage = ctx.message.text;
    await ctx.sendChatAction('typing');

    try {
      const dbUser = await this.ensureUser(userId, ctx.from);

      const existingCategories = await this.schemaManager.getExistingCategories();
      const userPatterns = await this.getUserPatterns(dbUser.id);
      const conversationContext = await this.getConversationContext(dbUser.id);

      const claudeResponse = await this.claudeService.processMessage(
        userMessage,
        existingCategories,
        userPatterns,
        conversationContext
      );

      await this.saveConversationMessage(dbUser.id, userMessage, 'user');

      if (claudeResponse.metadata.needs_clarification) {
        await ctx.reply(claudeResponse.metadata.clarification_question || 'Уточните, пожалуйста');
        return;
      }

      await this.processClaudeResponse(claudeResponse, dbUser.id);

      await this.sendResponse(ctx, claudeResponse);

      await this.saveConversationMessage(dbUser.id, claudeResponse.response.text, 'assistant');
    } catch (error) {
      console.error('Error handling message:', error);
      await ctx.reply('Произошла ошибка при обработке вашего сообщения. Попробуйте еще раз.');
    }
  }

  private async ensureUser(telegramId: number, from: any): Promise<any> {
    const result = await this.db.query(
      'SELECT * FROM users WHERE telegram_id = $1',
      [telegramId]
    );

    if (result.rows.length > 0) {
      return result.rows[0];
    }

    const insertResult = await this.db.query(
      `INSERT INTO users (telegram_id, username, first_name, last_name)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [telegramId, from.username, from.first_name, from.last_name]
    );

    return insertResult.rows[0];
  }

  private async getUserPatterns(userId: number): Promise<any> {
    const result = await this.db.query(
      'SELECT * FROM user_patterns WHERE user_id = $1 ORDER BY count DESC LIMIT 20',
      [userId]
    );
    return result.rows;
  }

  private async getConversationContext(userId: number): Promise<string[]> {
    const result = await this.db.query(
      'SELECT message, role FROM conversation_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
      [userId]
    );
    return result.rows
      .reverse()
      .map((r: any) => `${r.role}: ${r.message}`);
  }

  private async saveConversationMessage(
    userId: number,
    message: string,
    role: string
  ): Promise<void> {
    await this.db.query(
      'INSERT INTO conversation_history (user_id, message, role) VALUES ($1, $2, $3)',
      [userId, message, role]
    );
  }

  private async processClaudeResponse(
    response: ClaudeResponse,
    userId: number
  ): Promise<void> {
    if (response.schema_decision.needs_new_schema && response.schema_decision.schema) {
      if (response.schema_decision.storage_type === 'table') {
        await this.schemaManager.createDynamicTable(response.schema_decision.schema);
      } else {
        await this.schemaManager.saveSchemaMetadata(
          response.schema_decision.schema,
          'jsonb'
        );
      }
    }

    if (response.intent === 'create' && Object.keys(response.extracted_data).length > 0) {
      const data = { ...response.extracted_data, user_id: userId };
      await this.schemaManager.insertData(
        response.category,
        response.subcategory,
        data,
        userId
      );
    }

    await this.trackUserPattern(userId, response);
  }

  private async trackUserPattern(userId: number, response: ClaudeResponse): Promise<void> {
    await this.db.query(
      `INSERT INTO user_patterns (user_id, action_type, category)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING`,
      [userId, response.intent, response.category]
    );
  }

  private async sendResponse(ctx: Context, response: ClaudeResponse): Promise<void> {
    const buttons = response.response.buttons
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 5);

    if (buttons.length > 0) {
      const keyboard = buttons.map((btn) => [{
        text: btn.text,
        callback_data: JSON.stringify({
          action: btn.action,
          params: btn.params,
        }),
      }]);

      await ctx.reply(response.response.text, {
        reply_markup: {
          inline_keyboard: keyboard,
        },
      });
    } else {
      await ctx.reply(response.response.text);
    }
  }
}
