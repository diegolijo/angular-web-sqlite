# angular-web-sqlite

angular-web-sqlite is an Angular service that wraps the @sqlite.org/sqlite-wasm module. 
This Angular service takes care of the declaration and communication with a web worker, essential for utilizing the Origin Private File System (OPFS) storage back-end.

You only need to set the following headers on your server:

Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp

## Installation

Install the library using npm:

```bash
npm install angular-web-sqlite
``` 
## Methods

```typescript
init(dbName: string): Promise<any>                              //Initializes the SQLite database with the specified name.

executeSql(sql: string, params: any[]): Promise<any>            //Executes a single SQL query with optional parameters.

batchSql(sqls: [index: number]: [string, any[]]): Promise<any>  //Executes a batch of SQL statements as a transaction.
```


## Usage

```typescript
import { WebSqlite } from 'angular-web-sqlite';

@Injectable()
export class YourService {

  constructor(
    private webSqlite: WebSqlite
  ) {  }

  async initializeDatabase(dbName: string) {
    await this.webSqlite.init(dbName);
  }

  async executeQuery() {
    const sql = 'SELECT * FROM your_table';
    const params = [];
    const result = await this.webSqlite.executeSql(sql, params);
    // Process the result as needed
  }

  async batchSqlOperations() {
    const sqls = [
        ["CREATE TABLE IF NOT EXISTS your_table (a TEXT, b TEXT)", []],
        ["CREATE TABLE IF NOT EXISTS your_table2 (c TEXT, d TEXT)", []],
        ....];
    const result = await this.webSqlite.batchSql(sqls);
    // Process the result as needed
  }
}
```

## Angular Configuration
Make sure to update your angular.json file to include the necessary configurations for the library assets. The following additions should be made to the assets section:

```json
  "projects": {
    "app": {
      ...
      "architect": {
        ...
        "options": {
          "assets": [
            ...
            {
              "glob": "**/*.js",
              "input": "./node_modules/angular-web-sqlite/src/lib/assets",
              "output": "./sqlite-client/"
            },
            {
              "glob": "**/*",
              "input": "./node_modules/@sqlite.org/sqlite-wasm/sqlite-wasm/jswasm/",
              "output": "./sqlite-client/"
            }
          ]
        }
       }
     }
   }
```

This configuration ensures that the necessary assets—the SQLite working script (sqlite-worker.js) and the files from the @sqlite.org/sqlite-wasm module, which is used by the library under the hood—are copied to the output directory (www) during the build process.