import { Pool, PoolClient, QueryResultRow, types } from 'pg';
import { env } from '../config/env';
import { logger } from '../utils/logger';

types.setTypeParser(20, (v) => Number(v));   // BIGINT/COUNT -> number
types.setTypeParser(1700, (v) => Number(v)); // NUMERIC -> number
types.setTypeParser(1082, (v) => v);         // DATE stays 'YYYY-MM-DD'

export class Database {
  private static pool = new Pool({ connectionString: env.DATABASE_URL, max: 10 });

  static query<T extends QueryResultRow>(text: string, params: unknown[] = []) {
    return Database.pool.query<T>(text, params);
  }
  /** Runs fn inside BEGIN/COMMIT and rolls back on any error. */
  static async transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await Database.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (e) { await client.query('ROLLBACK'); throw e; } finally { client.release(); }
  }
  static getPool() { return Database.pool; }
  static async connect() { await Database.pool.query('SELECT 1'); logger.info('PostgreSQL connected'); }
  static async disconnect() { await Database.pool.end(); }
}
