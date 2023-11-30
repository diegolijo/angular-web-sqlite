/* eslint-disable @typescript-eslint/prefer-for-of */
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

const dbs: { [property: string]: Database } = {};

const log = (...args) => console.log(...args);
const error = (...args) => console.error(...args);

self.onmessage = async (messageEvent: MessageEvent) => {
  const sqliteMessage = messageEvent.data as ISqliteData;

  const stringifyParamObjects = (arr: (string | number)[]): void => {
    for (let i = 0; i < arr.length; i++) {
      if (typeof arr[i] !== 'number' && typeof arr[i] !== 'string') {
        arr[i] = String(arr[i]);
      }
    }
  };

  /**************************** INIT ************************/
  if (sqliteMessage.type === 'init') {
    try {
      if (dbs[sqliteMessage.filename]) {
        throw new Error('La base de datos ya ha sido iniciada');
      }
      sqlite3InitModule({
        print: log,
        printErr: error,
      }).then((sqlite3) => {
        try {
          dbs[sqliteMessage.filename] = new sqlite3.oo1.OpfsDb(sqliteMessage.filename, sqliteMessage.flags);
        } catch (err) {
          sqliteMessage.error = err;
        } finally {
          self.postMessage(sqliteMessage);
        }
      });
    } catch (err) {
      sqliteMessage.error = err;
      self.postMessage(sqliteMessage);
    }
  }

  /*********************   EXECUTE_SQL  *********************/
  if (sqliteMessage.type === 'executeSql') {
    try {
      if (!dbs[sqliteMessage.filename]) {
        throw new Error('Inicia la base de datos antes de realizar consultas');
      }
      const values: any = [];
      if (!sqliteMessage.param) {
        sqliteMessage.param = [];
      }
      stringifyParamObjects(sqliteMessage.param);
      dbs[sqliteMessage.filename].exec({
        sql: sqliteMessage.sql,
        bind: sqliteMessage.param,
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
      if (!dbs[sqliteMessage.filename]) {
        throw new Error('Inicia la base de datos antes de realizar consultas');
      }
      dbs[sqliteMessage.filename].exec('BEGIN TRANSACTION');
      let changes = 0;
      sqliteMessage.sqls.forEach(([sql, param]) => {
        if (!param) {
          param = [];
        }
        stringifyParamObjects(param);
        dbs[sqliteMessage.filename].exec({ sql: sql, bind: param });
        changes += dbs[sqliteMessage.filename].changes();
      });
      dbs[sqliteMessage.filename].exec('COMMIT');
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
      dbs[sqliteMessage.filename].exec('ROLLBACK');
      sqliteMessage.error = e;
    } finally {
      self.postMessage(sqliteMessage);
    }
  }

};

