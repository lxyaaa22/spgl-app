// electron/db/index.ts

import { config } from '../config';  // ← 改为命名导入
import { DbService } from './types';
import MysqlService from './mysqlImpl';
import OracleService from './oracleImpl';

let dbInstance: DbService | null = null;

export function getDbService(): DbService {
  if (dbInstance) return dbInstance;

  const type = config.DB_TYPE;
  console.log(`>>> 当前初始化数据库服务：${type}`);

  if (type === 'mysql') {
    dbInstance = new MysqlService();
  } else if (type === 'oracle') {
    dbInstance = new OracleService();
  } else {
    throw new Error(`配置错误：未知的数据库类型 ${type}`);
  }

  return dbInstance;
}
