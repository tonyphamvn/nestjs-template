import { MikroOrmModule } from '@mikro-orm/nestjs'
import { PostgreSqlDriver } from '@mikro-orm/postgresql'
import { Global, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { createDatabaseProvider, entities } from './database.provider'

@Global()
@Module({
  imports: [
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => createDatabaseProvider(config),
      inject: [ConfigService],
      driver: PostgreSqlDriver,
    }),
    MikroOrmModule.forFeature(entities),
  ],
  exports: [MikroOrmModule],
})
export class DatabaseModule {}
