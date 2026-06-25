const Encryption = require('./src/utils/encryption');
require('dotenv').config();

const enc = new Encryption(process.env.APP_SECRET || 'a'.repeat(32));
const encrypted = enc.encrypt('8Adm JQJn sk3n kN63 UA9r mQMq');
console.log(encrypted);
