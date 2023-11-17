/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable object-shorthand */
import { Database, default as sqlite3InitModule } from '@sqlite.org/sqlite-wasm';

interface ISqliteData {
  type: 'init' | 'executeSql' | 'batchSql' | 'batchReturnSql';
  id: string;
  flags: string;
  filename: string;
  error: any;
  sql: string;
  param: any;
  sqls: any;
  db: string;
  rows: any;
  rowsAffected: number;
}

let db: Database;
const log = (...args) => console.log(...args);
const error = (...args) => console.error(...args);

self.onmessage = async (messageEvent: MessageEvent) => {
  const sqliteMessage = messageEvent.data as ISqliteData;

  /**************************** INIT ************************/
  if (sqliteMessage.type === 'init') {
    sqlite3InitModule({
      print: log,
      printErr: error,
    }).then((sqlite3) => {
      try {
        db = new sqlite3.oo1.OpfsDb(sqliteMessage.filename, sqliteMessage.flags);
        sqliteMessage.db = db.filename;
      } catch (err) {
        sqliteMessage.error = err;
      } finally {
        self.postMessage(sqliteMessage);
      }
    });
  }

  /*********************   EXECUTE_SQL  *********************/
  if (sqliteMessage.type === 'executeSql') {
    try {
      if (!db) {
        throw new Error('Inicia la base de datos antes de realizar consultas');
      }
      const values: any = [];
      db.exec({
        sql: sqliteMessage.sql,
        bind: sqliteMessage.param || [],
        rowMode: 'object',
        callback: (row) => {
          values.push(row);
        }
      });
      sqliteMessage.rows = values;
    } catch (e) {
      sqliteMessage.error = e;
    } finally {
      self.postMessage(sqliteMessage);
    }
  }

  /************************ BATCH ************************/
  if (sqliteMessage.type === 'batchSql') {
    try {
      if (!db) {
        throw new Error('Inicia la base de datos antes de realizar consultas');
      }
      db.exec('BEGIN TRANSACTION');
      let changes = 0;
      sqliteMessage.sqls.forEach(([sql, param]) => {
        if (!param) {
          console.log(sql);
          param = [];
        }
        db.exec({ sql: sql, bind: param });
        changes += db.changes();
      });
      db.exec('COMMIT');
      sqliteMessage.rowsAffected = changes;
      /*
      let changes = 0;
      db.exec('BEGIN TRANSACTION');
      sqliteMessage.sqls.forEach(([sql, param]) => {
        if (!param) {
          console.log(sql);
          param = [];
        }
        db.exec(sql, param);
      });
      db.exec('COMMIT');
      changes += db.changes();

      let changes = 0;
      sqliteMessage.sqls.forEach(([sql, param]) => {
        if (!param) {
          console.log(sql);
          param = [];
        }
        const stmt = db.prepare(sql);
        !param.length || stmt.bind(param);
        stmt.step();
        changes += db.changes();
      }); */
    } catch (e) {
      db.exec('ROLLBACK');
      sqliteMessage.error = e;
    } finally {
      self.postMessage(sqliteMessage);
    }
  }
};
