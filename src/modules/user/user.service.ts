import { EntityManager } from '@mikro-orm/postgresql'
import { Inject, Injectable } from '@nestjs/common'
import { User } from '@src/database/entities'
import { WINSTON_MODULE_NEST_PROVIDER, WinstonLogger } from 'nest-winston'

@Injectable()
export class UserService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: WinstonLogger,
    private readonly em: EntityManager,
  ) {
    this.logger.setContext(UserService.name)
  }

  public async getUsers() {
    return this.em.findAll(User, { where: {} })
  }
}
