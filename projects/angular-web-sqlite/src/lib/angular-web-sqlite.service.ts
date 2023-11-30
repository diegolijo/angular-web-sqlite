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

@Injectable()
export class WebSqlite {

  private sqliteClientWorkerPath = 'sqlite-client/sqlite-worker.js';
  private worker!: Worker;
  private queuedPromises: any = {};
  private isInitialized!: boolean;
  private filename!: string;

  constructor(
  ) { }

  init(dbName: string, flags?: string) {
    this.worker = new Worker(this.sqliteClientWorkerPath, { type: 'module' });
    this.worker.onmessage = this.messageReceived.bind(this);
    this.filename = `/${dbName}.sqlite3`;
    const initDb: Message = { type: 'init', filename: this.filename, flags: flags || 'ct', id: this.generateGuid() };
    this.worker.postMessage(initDb);
    return new Promise<any>((resolve, reject) => {
      this.queuedPromises[initDb.id] = {
        resolve,
        reject,
      };
    });
  }

  public async executeSql(sql: string, params: any) {
    await this.waitForInitialization();
    const executeSql: Message =
      { type: 'executeSql', sql: sql, filename: this.filename, param: params, id: this.generateGuid() };
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
  public async batchSql(sqls: any) {
    await this.waitForInitialization();
    const batchSql: Message =
      { type: 'batchSql', sqls: sqls, filename: this.filename, id: this.generateGuid() };
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
        case 'init':
          if (sqliteMessage.error) {
            return promise.reject(sqliteMessage.error);
          }
          this.isInitialized = true;
          return promise.resolve(sqliteMessage.filename);
        case 'executeSql':
          if (sqliteMessage.error) {
            return promise.reject(sqliteMessage.error);
          }
          return promise.resolve({ rows: sqliteMessage.rows });
        case 'batchSql':
          if (sqliteMessage.error) {
            return promise.reject(sqliteMessage.error);
          }
          return promise.resolve({ rowsAffected: sqliteMessage.rowsAffected });
        case 'batchReturnSql':
          if (sqliteMessage.error) {
            return promise.reject(sqliteMessage.error);
          }
          return promise.resolve({ rows: sqliteMessage.rows });
      }
    }
  }

  private async waitForInitialization() {
    while (!this.isInitialized) {
      console.log('esperando inicialización...');
      await new Promise(resolve => setTimeout(resolve, 100)); // Wait for 100 milliseconds before checking again
    }
  }

  private generateGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
