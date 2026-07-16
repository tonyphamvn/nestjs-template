import { Controller, Get, Res } from '@nestjs/common'
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger'
import { FastifyReply } from 'fastify'

import { HealthService } from './health.service'

@Controller()
@ApiTags('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiExcludeEndpoint()
  getHello(@Res() res: FastifyReply) {
    res.redirect('/api/v1/health')
  }

  @Get('health')
  checkHealth() {
    return this.healthService.checkHealth()
  }
}
