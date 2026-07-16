import 'dotenv/config'
import { DataSource } from 'typeorm'

import { User } from './entities'

export default new DataSource({
  type: (process.env.DB_DIALECT as 'postgres') || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  database: process.env.DB_NAME || 'db_name',
  entities: [User],
  migrations: ['src/infrastructure/database/migrations/*.ts'],
})
