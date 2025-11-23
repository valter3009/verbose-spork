import { Pool, PoolClient } from 'pg';
import { config } from '../config/config';

export class Database {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: config.database.url,
    });
  }

  async connect(): Promise<void> {
    try {
      const client = await this.pool.connect();
      console.log('Connected to PostgreSQL database');
      client.release();
      await this.initDatabase();
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw error;
    }
  }

  async query(text: string, params?: any[]): Promise<any> {
    try {
      const result = await this.pool.query(text, params);
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  private async initDatabase(): Promise<void> {
    await this.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        telegram_id BIGINT UNIQUE NOT NULL,
        username VARCHAR(255),
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await this.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        category VARCHAR(255) NOT NULL,
        subcategory VARCHAR(255),
        description TEXT,
        storage_type VARCHAR(50) NOT NULL,
        schema JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(category, subcategory)
      )
    `);

    await this.query(`
      CREATE TABLE IF NOT EXISTS user_data_jsonb (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        category VARCHAR(255) NOT NULL,
        subcategory VARCHAR(255),
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await this.query(`
      CREATE TABLE IF NOT EXISTS user_patterns (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        action_type VARCHAR(255) NOT NULL,
        category VARCHAR(255),
        button_action VARCHAR(255),
        count INTEGER DEFAULT 1,
        last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await this.query(`
      CREATE TABLE IF NOT EXISTS conversation_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        role VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database initialized');
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
