import { defineConfig } from '@mikro-orm/postgresql'
import { configDotenv } from 'dotenv'
configDotenv()

import { User } from './infrastructure/database/entities/User'

export default defineConfig({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT ?? '', 10) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  dbName: process.env.DB_NAME || 'db_name',
  entities: [User],
  entitiesTs: [User],
  discovery: { warnWhenNoEntities: false },
  debug: false,
  allowGlobalContext: true,
  pool: {
    min: 2,
    max: 20,
  },
  migrations: {
    path: './dist/src/infrastructure/database/migrations',
    pathTs: './src/infrastructure/database/migrations',
  },
  seeder: {
    path: './dist/src/infrastructure/database/seeders',
    pathTs: './src/infrastructure/database/seeders',
  },
})
