import { Database } from './db';
import { SchemaDefinition } from '../types/claude-response';

export class SchemaManager {
  constructor(private db: Database) {}

  async createDynamicTable(schema: SchemaDefinition): Promise<void> {
    const tableName = schema.subcategory
      ? `${schema.category}_${schema.subcategory}`
      : schema.category;

    const fields: string[] = [];
    for (const [fieldName, fieldDef] of Object.entries(schema.fields)) {
      let fieldType: string;
      switch (fieldDef.type) {
        case 'integer':
          fieldType = 'INTEGER';
          break;
        case 'float':
          fieldType = 'FLOAT';
          break;
        case 'text':
          fieldType = 'TEXT';
          break;
        case 'date':
          fieldType = 'DATE';
          break;
        case 'datetime':
          fieldType = 'TIMESTAMP';
          break;
        case 'boolean':
          fieldType = 'BOOLEAN';
          break;
        case 'jsonb':
          fieldType = 'JSONB';
          break;
        default:
          fieldType = 'TEXT';
      }

      let fieldDef_str = `${fieldName} ${fieldType}`;
      if (fieldDef.required) {
        fieldDef_str += ' NOT NULL';
      }
      if (fieldDef.default !== undefined && fieldDef.default !== null) {
        fieldDef_str += ` DEFAULT ${fieldDef.default}`;
      }
      fields.push(fieldDef_str);
    }

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        ${fields.join(',\n        ')}
      )
    `;

    try {
      await this.db.query(createTableQuery);
      console.log(`Table ${tableName} created successfully`);

      if (schema.indexes && schema.indexes.length > 0) {
        for (const indexField of schema.indexes) {
          const indexName = `idx_${tableName}_${indexField}`;
          await this.db.query(`
            CREATE INDEX IF NOT EXISTS ${indexName} ON ${tableName}(${indexField})
          `);
        }
      }

      await this.saveSchemaMetadata(schema, 'table');
    } catch (error) {
      console.error(`Error creating table ${tableName}:`, error);
      throw error;
    }
  }

  async saveSchemaMetadata(
    schema: SchemaDefinition,
    storageType: 'table' | 'jsonb'
  ): Promise<void> {
    await this.db.query(
      `INSERT INTO categories (category, subcategory, description, storage_type, schema)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (category, subcategory) DO UPDATE
       SET description = $3, storage_type = $4, schema = $5`,
      [
        schema.category,
        schema.subcategory || null,
        schema.description,
        storageType,
        JSON.stringify(schema),
      ]
    );
  }

  async getExistingCategories(): Promise<any[]> {
    const result = await this.db.query(`
      SELECT category, subcategory, description, storage_type, schema
      FROM categories
      ORDER BY created_at DESC
    `);
    return result.rows;
  }

  async insertData(
    category: string,
    subcategory: string | null,
    data: Record<string, any>,
    userId: number
  ): Promise<void> {
    const categories = await this.getExistingCategories();
    const categoryInfo = categories.find(
      (c) => c.category === category && c.subcategory === subcategory
    );

    if (!categoryInfo) {
      throw new Error(`Category ${category}/${subcategory} not found`);
    }

    if (categoryInfo.storage_type === 'table') {
      const tableName = subcategory ? `${category}_${subcategory}` : category;
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

      await this.db.query(
        `INSERT INTO ${tableName} (${keys.join(', ')})
         VALUES (${placeholders})`,
        values
      );
    } else {
      await this.db.query(
        `INSERT INTO user_data_jsonb (user_id, category, subcategory, data)
         VALUES ($1, $2, $3, $4)`,
        [userId, category, subcategory, JSON.stringify(data)]
      );
    }
  }

  async queryData(
    category: string,
    subcategory: string | null,
    userId: number,
    limit: number = 10
  ): Promise<any[]> {
    const categories = await this.getExistingCategories();
    const categoryInfo = categories.find(
      (c) => c.category === category && c.subcategory === subcategory
    );

    if (!categoryInfo) {
      return [];
    }

    if (categoryInfo.storage_type === 'table') {
      const tableName = subcategory ? `${category}_${subcategory}` : category;
      const result = await this.db.query(
        `SELECT * FROM ${tableName} WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
        [userId, limit]
      );
      return result.rows;
    } else {
      const result = await this.db.query(
        `SELECT data FROM user_data_jsonb
         WHERE user_id = $1 AND category = $2 AND subcategory = $3
         ORDER BY created_at DESC LIMIT $4`,
        [userId, category, subcategory, limit]
      );
      return result.rows.map((r) => r.data);
    }
  }
}
