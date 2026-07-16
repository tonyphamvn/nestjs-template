import { Injectable } from '@nestjs/common'
import { HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus'
import { PrismaService } from '@src/infrastructure/database/prisma.service'
import { WinstonLogger } from 'nest-winston'

@Injectable()
export class HealthService {
  constructor(
    private logger: WinstonLogger,
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private prisma: PrismaService,
  ) {
    this.logger.setContext(HealthService.name)
  }

  checkHealth() {
    return this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prisma),
    ])
  }
}
