import { Global, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { SequelizeModule } from '@nestjs/sequelize'

import { User } from './models/user.model'

@Global()
@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        dialect: (config.get('database.dialect') as 'postgres') || 'postgres',
        host: config.get<string>('database.host'),
        port: config.get<number>('database.port'),
        username: config.get<string>('database.user'),
        password: config.get<string>('database.password'),
        database: config.get<string>('database.name'),
        models: [User],
        autoLoadModels: true,
        synchronize: false,
      }),
    }),
    SequelizeModule.forFeature([User]),
  ],
  exports: [SequelizeModule],
})
export class DatabaseModule {}
