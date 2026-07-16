import { Entity, EntityDTO, PrimaryKey, Property } from '@mikro-orm/core'
import { ApiProperty } from '@nestjs/swagger'

@Entity({ tableName: 'users' })
export class User {
  @PrimaryKey()
  @ApiProperty()
  public id!: string

  @Property()
  @ApiProperty()
  public email!: string

  @Property()
  @ApiProperty()
  public username!: string

  @Property({ type: 'timestamp', defaultRaw: 'CURRENT_TIMESTAMP' })
  @ApiProperty()
  public createdAt?: Date = new Date()

  @Property({
    type: 'timestamp',
    onUpdate: () => new Date(),
    defaultRaw: 'CURRENT_TIMESTAMP',
  })
  @ApiProperty()
  public updatedAt?: Date = new Date()

  constructor(data: Partial<User> = {}) {
    Object.assign(this, data)
  }
}

export type UserDTO = EntityDTO<User>
