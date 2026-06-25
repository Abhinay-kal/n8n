const { loadConfig } = require('./src/config/config');
const config = loadConfig();
console.log(JSON.stringify(config, null, 2));
