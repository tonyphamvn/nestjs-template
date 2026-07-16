import { Injectable } from '@nestjs/common'
import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus'
import { WinstonLogger } from 'nest-winston'

@Injectable()
export class HealthService {
  constructor(
    private logger: WinstonLogger,
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {
    this.logger.setContext(HealthService.name)
  }

  checkHealth() {
    return this.health.check([() => this.db.pingCheck('database')])
  }
}
