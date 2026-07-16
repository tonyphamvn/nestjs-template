export default () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.APP_PORT ?? '', 10) || 8080,
  ip: process.env.IP || '0.0.0.0',

  // Database Connection Details
  database: {
    dialect: process.env.DB_DIALECT || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT ?? '', 10) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    name: process.env.DB_NAME || 'db_name',
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '', 10) || 6379,
  },

  cacheTTL: process.env.CACHE_TTL || 5000,
})
