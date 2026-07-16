import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from '@src/infrastructure/database/entities'
import { WINSTON_MODULE_NEST_PROVIDER, WinstonLogger } from 'nest-winston'
import { Repository } from 'typeorm'

@Injectable()
export class UsersService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: WinstonLogger,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {
    this.logger.setContext(UsersService.name)
  }

  public async getUsers() {
    return this.usersRepository.find()
  }
}
