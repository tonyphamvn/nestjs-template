import { BullModule } from '@nestjs/bullmq'
import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { createQueueConfig } from '@src/app.config'
import config from '@src/config'
import { WinstonLogger } from 'nest-winston'

import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
  imports: [
    ConfigModule.forRoot({ load: [config] }),
    CacheModule.register(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => createQueueConfig(config),
      inject: [ConfigService],
    }),
  ],
  controllers: [UserController],
  providers: [UserService, WinstonLogger],
  exports: [UserService],
})
export class UserModule {}
