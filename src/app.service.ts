import { Injectable } from '@nestjs/common'
import { HealthCheckService, MikroOrmHealthIndicator } from '@nestjs/terminus'
import { WinstonLogger } from 'nest-winston'

@Injectable()
export class AppService {
  constructor(
    private logger: WinstonLogger,
    private health: HealthCheckService,
    private db: MikroOrmHealthIndicator,
  ) {
    this.logger.setContext(AppService.name)
  }

  checkHealth() {
    return this.health.check([() => this.db.pingCheck('database')])
  }
}
