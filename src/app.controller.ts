import { Controller, Get, Res } from '@nestjs/common'
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger'
import { FastifyReply } from 'fastify'

import { AppService } from './app.service'

@Controller()
@ApiTags('app')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiExcludeEndpoint()
  getHello(@Res() res: FastifyReply) {
    res.redirect('/api/v1/health')
  }

  @Get('health')
  checkHealth() {
    return this.appService.checkHealth()
  }
}
