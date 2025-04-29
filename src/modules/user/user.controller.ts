import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { UserService } from './user.service'

@Controller('users')
@ApiTags('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('')
  public async getUsers() {
    return this.userService.getUsers()
  }
}
