// electron/db/mysqlImpl.ts

import mysql from 'mysql2/promise';
import { config } from '../config';
import { KcItem, DbService, KcQueryParams } from './types';

class MysqlService implements DbService {
  private pool: mysql.Pool;

  constructor() {
    this.pool = mysql.createPool(config.mysql);
  }

  private async query(sql: string, params: any[] = []): Promise<any> {
    const [rows] = await this.pool.execute(sql, params);
    return rows;
  }

  async addKc(data: KcItem): Promise<KcItem> {
    const sql = `INSERT INTO kc (name, category, price, stock, create_time) VALUES (?, ?, ?, ?, NOW())`;
    const params = [data.name, data.category, data.price, data.stock];
    const result: any = await this.query(sql, params);
    return { id: result.insertId, ...data };
  }

  async deleteKc(id: number): Promise<boolean> {
    const sql = `DELETE FROM kc WHERE id = ?`;
    await this.query(sql, [id]);
    return true;
  }

  async updateKc(data: KcItem): Promise<KcItem> {
    const sql = `UPDATE kc SET name=?, category=?, price=?, stock=? WHERE id=?`;
    const params = [data.name, data.category, data.price, data.stock, data.id];
    await this.query(sql, params);
    return data;
  }

  // ✅ 修改查询方法支持模糊搜索
  async getKcList(params?: KcQueryParams): Promise<KcItem[]> {
    let sql = `SELECT * FROM kc WHERE 1=1`;
    const queryParams: any[] = [];

    // 如果有搜索关键词，添加模糊查询条件
    if (params?.keyword && params.keyword.trim()) {
      sql += ` AND name LIKE ?`;
      queryParams.push(`%${params.keyword.trim()}%`);
    }

    sql += ` ORDER BY create_time DESC`;
    
    return await this.query(sql, queryParams);
  }
}

export default MysqlService;
