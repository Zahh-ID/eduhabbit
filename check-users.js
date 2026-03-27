const Database = require('better-sqlite3');
const db = new Database('eduhabit.db');
const users = db.prepare('SELECT id, email FROM users').all();
console.log(users);
db.close();
