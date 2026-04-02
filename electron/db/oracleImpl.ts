// electron/db/oracleImpl.ts

import oracledb from 'oracledb';
import { config } from '../config';
import { KcItem, DbService, KcQueryParams } from './types';

class OracleService implements DbService {
  private pool: oracledb.Pool | null = null;

  constructor() {
    this.initPool();
  }

  // 初始化连接池
  private async initPool(): Promise<void> {
    try {
      await oracledb.createPool({
        user: config.oracle.user,
        password: config.oracle.password,
        connectString: config.oracle.connectString,
        poolAlias: config.oracle.poolAlias,
        poolMin: config.oracle.poolMin,
        poolMax: config.oracle.poolMax,
        poolIncrement: config.oracle.poolIncrement,
        poolTimeout: 60,
        queueTimeout: 60000
      });
      console.log('>>> Oracle 连接池初始化成功');
    } catch (error) {
      console.error('>>> Oracle 连接池初始化失败:', error);
      throw error;
    }
  }

  // 获取数据库连接
  private async getConnection(): Promise<oracledb.Connection> {
    return await oracledb.getConnection(config.oracle.poolAlias);
  }

  // 通用查询方法
  private async executeQuery(sql: string, binds: any = {}, options: any = {}): Promise<any[]> {
    let connection: oracledb.Connection | null = null;
    try {
      connection = await this.getConnection();
      const result = await connection.execute(sql, binds, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        autoCommit: true,
        ...options
      });
      return (result.rows || []).map((row: any) =>
        Object.fromEntries(
          Object.entries(row).map(([key, value]) => [key.toLowerCase(), value])
        )
      );
    } catch (error) {
      console.error('Oracle 执行错误:', error);
      throw error;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (e) {
          console.error('关闭连接失败:', e);
        }
      }
    }
  }

  // ✅ 新增
  async addKc(data: KcItem): Promise<KcItem> {
    const sql = `
      INSERT INTO KC ( NAME, CATEGORY, PRICE, STOCK, CREATE_TIME) 
      VALUES ( :name, :category, :price, :stock, SYSDATE)
      RETURNING ID INTO :id
    `;
    
    const binds: any = {
      name: data.name,
      category: data.category,
      price: data.price,
      stock: data.stock,
      id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
    };

    let connection: oracledb.Connection | null = null;
    try {
      connection = await this.getConnection();
      const result = await connection.execute(sql, binds, {
        autoCommit: true
      });
      
      // 获取返回的 ID
      const newId = result.outBinds?.id;
      return { ...data, id: newId };
    } catch (error) {
      console.error('Oracle addKc 错误:', error);
      throw error;
    } finally {
      if (connection) {
        try { await connection.close(); } catch (e) {}
      }
    }
  }

  // ✅ 删除
  async deleteKc(id: number): Promise<boolean> {
    const sql = `DELETE FROM KC WHERE ID = :id`;
    await this.executeQuery(sql, { id });
    return true;
  }

  // ✅ 修改
  async updateKc(data: KcItem): Promise<KcItem> {
    const sql = `
      UPDATE KC 
      SET NAME = :name, 
          CATEGORY = :category, 
          PRICE = :price, 
          STOCK = :stock 
      WHERE ID = :id
    `;
    
    const binds: any = {
      id: data.id,
      name: data.name,
      category: data.category,
      price: data.price,
      stock: data.stock
    };

    await this.executeQuery(sql, binds);
    return data;
  }

  // ✅ 查询（支持模糊搜索）
  async getKcList(params?: KcQueryParams): Promise<KcItem[]> {
    let sql = `SELECT * FROM KC WHERE 1 = 1`;
    const binds: any = {};

    // 模糊查询
    if (params?.keyword && params.keyword.trim()) {
      sql += ` AND NAME LIKE :keyword`;
      binds.keyword = `%${params.keyword.trim()}%`;
    }

    sql += ` ORDER BY CREATE_TIME DESC`;

    return await this.executeQuery(sql, binds);
  }
}

export default OracleService;
