import { Injectable } from '@nestjs/common'
import { HealthCheckService, SequelizeHealthIndicator } from '@nestjs/terminus'
import { WinstonLogger } from 'nest-winston'

@Injectable()
export class HealthService {
  constructor(
    private logger: WinstonLogger,
    private health: HealthCheckService,
    private db: SequelizeHealthIndicator,
  ) {
    this.logger.setContext(HealthService.name)
  }

  checkHealth() {
    return this.health.check([() => this.db.pingCheck('database')])
  }
}
