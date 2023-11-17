/* eslint-disable one-var */
/* eslint-disable no-bitwise */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable object-shorthand */
/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';

export interface Message {
  type: 'init' | 'executeSql' | 'batchSql' | 'batchReturnSql';
  id: string;
  flags?: string;
  filename?: string;
  error?: any;
  sql?: string;
  param?: any;
  sqls?: any;
  rows?: any;
  rowsAffected?: number;
}

@Injectable({
  providedIn: 'root',
})
export class WebSqlite {

  private sqliteClientWorkerPath = 'assets/sqlite-worker.js'; //TODO
  private worker!: Worker;
  private queuedPromises: any = {};


  constructor(
  ) { }


  init(dbName: string) {

    this.worker = new Worker(this.sqliteClientWorkerPath, { type: 'module' });
    this.worker.onmessage = this.messageReceived.bind(this);
    const initDb: Message = { type: 'init', filename: `/${dbName}.sqlite3`, flags: 'ct', id: this.generateGuid() };
    this.worker.postMessage(initDb);
    return new Promise<any>((resolve, reject) => {
      this.queuedPromises[initDb.id] = {
        resolve,
        reject,
      };
    });
  }


  public executeSql(sql: string, params: any) {
    const executeSql: Message =
      { type: 'executeSql', sql: sql, param: params, id: this.generateGuid() };
    this.worker.postMessage(executeSql);
    return new Promise<any>((resolve, reject) => {
      this.queuedPromises[executeSql.id] = {
        resolve,
        reject
      };
    });

  }

  /**
   * Funcion para transacciones sin return
   */
  batchSql(sqls: any) {
    const batchSql: Message =
      { type: 'batchSql', sqls: sqls, id: this.generateGuid() };
    this.worker.postMessage(batchSql);
    return new Promise<any>((resolve, reject) => {
      this.queuedPromises[batchSql.id] = {
        resolve,
        reject
      };
    });
  }

  /**
   * Funcion que devuelve la solucion a multiples transacciones
   */
  public async batchReturnSql(sqls: any[]) {
    // TODO
  }



  private messageReceived(message: MessageEvent) {
    const sqliteMessage: Message = message.data;
    if (sqliteMessage.id && this.queuedPromises.hasOwnProperty(sqliteMessage.id)) {
      const promise = this.queuedPromises[sqliteMessage.id];
      delete this.queuedPromises[sqliteMessage.id];
      switch (sqliteMessage.type) {
        case 'batchSql':
          if (sqliteMessage.error) {
            return promise.reject(sqliteMessage.error);
          }
          return promise.resolve({ rowsAffected: sqliteMessage.rowsAffected });
        case 'executeSql' || 'batchReturnSql':
          if (sqliteMessage.error) {
            return promise.reject(sqliteMessage.error);
          }
          return promise.resolve({ rows: sqliteMessage.rows });
        case 'init':
          if (sqliteMessage.error) {
            return promise.reject(sqliteMessage.error);
          }
          return promise.resolve(sqliteMessage.filename);
      }
    }
  }



  private generateGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
