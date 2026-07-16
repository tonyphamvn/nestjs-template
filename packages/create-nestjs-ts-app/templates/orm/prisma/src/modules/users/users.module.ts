import { Module } from '@nestjs/common'
import { WinstonLogger } from 'nest-winston'

import { UsersController } from './users.controller'
import { UsersService } from './users.service'

@Module({
  controllers: [UsersController],
  providers: [UsersService, WinstonLogger],
  exports: [UsersService],
})
export class UsersModule {}
