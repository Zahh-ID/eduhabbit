const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const db = new Database('eduhabit.db');
const user = db.prepare('SELECT password_hash FROM users WHERE email = ?').get('test@test.com');
if (user) {
    const isMatch = bcrypt.compareSync('test123', user.password_hash);
    console.log('Password match:', isMatch);
    console.log('Hash:', user.password_hash);
} else {
    console.log('User not found');
}
db.close();
