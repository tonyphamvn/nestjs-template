import { Module } from '@nestjs/common'
import { TerminusModule } from '@nestjs/terminus'
import { WinstonLogger } from 'nest-winston'

import { HealthController } from './health.controller'
import { HealthService } from './health.service'

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [HealthService, WinstonLogger],
})
export class HealthModule {}
