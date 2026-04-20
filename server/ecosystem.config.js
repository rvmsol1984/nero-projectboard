module.exports = {
  apps: [
    {
      name: 'nero-projectboard',
      script: 'index.js',
      cwd: '/root/nero-projectboard/server',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production',
        PORT: 3010,
      },
      error_file: '/var/log/pm2/projectboard-error.log',
      out_file: '/var/log/pm2/projectboard-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
