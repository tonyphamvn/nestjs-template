import { Inject, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { User } from '@src/infrastructure/database/models/user.model'
import { WINSTON_MODULE_NEST_PROVIDER, WinstonLogger } from 'nest-winston'

@Injectable()
export class UsersService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: WinstonLogger,
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {
    this.logger.setContext(UsersService.name)
  }

  public async getUsers() {
    return this.userModel.findAll()
  }
}
