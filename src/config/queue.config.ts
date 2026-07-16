import { BullRootModuleOptions } from '@nestjs/bullmq'
import { ConfigService } from '@nestjs/config'

export const createQueueConfig = (
  configService: ConfigService,
): BullRootModuleOptions => ({
  connection: {
    host: configService.get<string>('redis.host'),
    port: configService.get<number>('redis.port'),
  },
  defaultJobOptions: {
    attempts: 3,
    removeOnComplete: true,
  },
})
