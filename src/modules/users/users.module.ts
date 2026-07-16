import { BullModule } from '@nestjs/bullmq'
import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import config from '@src/config'
import { createQueueConfig } from '@src/config/queue.config'
import { WinstonLogger } from 'nest-winston'

import { UsersController } from './users.controller'
import { UsersService } from './users.service'

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
  controllers: [UsersController],
  providers: [UsersService, WinstonLogger],
  exports: [UsersService],
})
export class UsersModule {}
