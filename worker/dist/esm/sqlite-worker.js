var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step (result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { default as sqlite3InitModule } from '@sqlite.org/sqlite-wasm';
let db;
const log = (...args) => console.log(...args);
const error = (...args) => console.error(...args);
self.onmessage = (messageEvent) => __awaiter(void 0, void 0, void 0, function* () {
    const sqliteMessage = messageEvent.data;
    if (sqliteMessage.type === 'init') {
        sqlite3InitModule({
            print: log,
            printErr: error,
        }).then((sqlite3) => {
            try {
                db = new sqlite3.oo1.OpfsDb(sqliteMessage.filename, sqliteMessage.flags);
                sqliteMessage.db = db.filename;
            }
            catch (err) {
                sqliteMessage.error = err;
            }
            finally {
                self.postMessage(sqliteMessage);
            }
        });
    }
    if (sqliteMessage.type === 'executeSql') {
        try {
            const values = [];
            db.exec({
                sql: sqliteMessage.sql,
                bind: sqliteMessage.param || [],
                rowMode: 'object',
                callback: (row) => {
                    values.push(row);
                }
            });
            sqliteMessage.rows = values;
        }
        catch (e) {
            sqliteMessage.error = e;
        }
        finally {
            self.postMessage(sqliteMessage);
        }
    }
    if (sqliteMessage.type === 'batchSql') {
        try {
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
        }
        catch (e) {
            db.exec('ROLLBACK');
            sqliteMessage.error = e;
        }
        finally {
            self.postMessage(sqliteMessage);
        }
    }
});
//# sourceMappingURL=sqlite-worker.js.map