module.exports = {
  apps: [
    {
      name: 'nexus-api',
      script: 'apps/api/dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 4020,
        API_PORT: 4020,
      },
    },
    {
      name: 'nexus-web',
      cwd: 'apps/web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3020',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3020,
        INTERNAL_API_URL: 'http://127.0.0.1:4020/api',
      },
    },
  ],
};
