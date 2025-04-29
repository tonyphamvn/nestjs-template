import { defineConfig } from '@mikro-orm/postgresql'
import { configDotenv } from 'dotenv'
configDotenv()

export default defineConfig({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  dbName: process.env.DB_NAME || 'db_name',
  discovery: { warnWhenNoEntities: false },
  debug: false,
  allowGlobalContext: true,
  pool: {
    min: 2,
    max: 20,
  },
  entities: ['./dist/database/entities/*.js'],
  entitiesTs: ['./src/database/entities/*.ts'],
  migrations: {
    path: './dist/database/migrations',
    pathTs: './src/database/migrations',
  },
  seeder: {
    path: './dist/database/seeders',
    pathTs: './src/database/seeders',
  },
})
