import { Options as MikroOrmOptions } from '@mikro-orm/core'
import { defineConfig } from '@mikro-orm/postgresql'
import { ConfigService } from '@nestjs/config'

import { User } from './entities'

export const entities = [User]

export const createDatabaseProvider = (
  configService: ConfigService,
): MikroOrmOptions =>
  defineConfig({
    host: configService.get<string>('database.host'),
    port: configService.get<number>('database.port'),
    user: configService.get<string>('database.user'),
    password: configService.get<string>('database.password'),
    dbName: configService.get<string>('database.name'),
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
