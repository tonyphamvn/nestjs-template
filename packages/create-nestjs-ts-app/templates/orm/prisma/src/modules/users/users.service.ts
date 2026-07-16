import { Inject, Injectable } from '@nestjs/common'
import { PrismaService } from '@src/infrastructure/database/prisma.service'
import { WINSTON_MODULE_NEST_PROVIDER, WinstonLogger } from 'nest-winston'

@Injectable()
export class UsersService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: WinstonLogger,
    private readonly prisma: PrismaService,
  ) {
    this.logger.setContext(UsersService.name)
  }

  public async getUsers() {
    return this.prisma.user.findMany()
  }
}
