module.exports = {
  apps: [
    {
      name: 'api',
      script: 'src/scripts/serve.sh',
      ignore_watch: ['node_modules', 'logs'],
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
      },
      env_development: {
        NODE_ENV: 'development',
      },
    },
  ],
}
