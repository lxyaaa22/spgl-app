// electron/config.ts

export interface MysqlConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
  waitForConnections: boolean;
  connectionLimit: number;
  queueLimit: number;
}

export interface OracleConfig {
  user: string;
  password: string;
  connectString: string;
  poolAlias: string;
  poolMin: number;
  poolMax: number;
  poolIncrement: number;
}

export interface AppConfig {
  DB_TYPE: 'mysql' | 'oracle';
  mysql: MysqlConfig;
  oracle: OracleConfig;
}

// 使用命名导出，不要用 export default
export const config: AppConfig = {
  DB_TYPE: 'oracle',

  mysql: {
    host: 'localhost',
    user: 'root',
    password: '123',
    database: 'spgl',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  },

  oracle: {
    user: 'SCTJ',
    password: '123',
    connectString: '10.122.7.3:1521/rjkf',
    poolAlias: 'kc',
    poolMin: 2,
    poolMax: 10,
    poolIncrement: 1
  }
};
