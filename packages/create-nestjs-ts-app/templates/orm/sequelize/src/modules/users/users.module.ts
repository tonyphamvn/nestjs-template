import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'
import { User } from '@src/infrastructure/database/models/user.model'
import { WinstonLogger } from 'nest-winston'

import { UsersController } from './users.controller'
import { UsersService } from './users.service'

@Module({
  imports: [SequelizeModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, WinstonLogger],
  exports: [UsersService],
})
export class UsersModule {}
