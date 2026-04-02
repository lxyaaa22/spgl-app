// electron/oracledb.d.ts

declare module 'oracledb' {
  const OUT_FORMAT_OBJECT: any
  const BIND_OUT: any
  const NUMBER: any
  
  interface Connection {
    execute(sql: string, binds?: any, options?: any): Promise<any>
    close(): Promise<void>
  }
  
  interface Pool {
    getConnection(): Promise<Connection>
    close(): Promise<void>
  }
  
  function createPool(config: any): Promise<Pool>
  function getConnection(alias?: string): Promise<Connection>
  
  export { OUT_FORMAT_OBJECT, BIND_OUT, NUMBER, Connection, Pool, createPool, getConnection }
  export default { OUT_FORMAT_OBJECT, BIND_OUT, NUMBER, createPool, getConnection }
}
