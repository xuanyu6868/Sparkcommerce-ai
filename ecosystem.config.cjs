module.exports = {
  apps: [
    {
      name: 'sparkcommerce',
      script: 'server/dist/app.js',
      cwd: '/opt/sparkcommerce',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '500M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: '/var/log/sparkcommerce-error.log',
      out_file: '/var/log/sparkcommerce-out.log',
    },
  ],
};
