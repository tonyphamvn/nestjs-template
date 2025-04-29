import { BullModule } from '@nestjs/bullmq'
import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TerminusModule } from '@nestjs/terminus'
import { WinstonLogger, WinstonModule } from 'nest-winston'

import { createQueueConfig } from './app.config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import configuration from './config'
import { DatabaseModule } from './database/database.module'
import { winstonLoggerConfig } from './helpers/logger'
import { UserModule } from './modules/user/user.module'

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration] }),
    WinstonModule.forRoot(winstonLoggerConfig),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => createQueueConfig(config),
      inject: [ConfigService],
    }),
    CacheModule.register({ isGlobal: true }),
    DatabaseModule,
    TerminusModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService, WinstonLogger],
})
export class AppModule {}
