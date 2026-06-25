module.exports = {
  apps: [{
    name: 'claude-worker',
    script: 'src/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '2G',
    kill_timeout: 10000, // Allow 10s for graceful shutdown sequence
    env: {
      NODE_ENV: 'production'
    },
    error_file: 'logs/pm2_error.log',
    out_file: 'logs/pm2_out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
