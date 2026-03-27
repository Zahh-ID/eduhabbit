const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const db = new Database('eduhabit.db');
const hash = bcrypt.hashSync('test123', 12);
const result = db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(hash, 'test@test.com');
console.log('Update result:', result);
db.close();
