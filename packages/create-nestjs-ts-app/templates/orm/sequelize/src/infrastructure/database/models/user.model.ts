import { ApiProperty } from '@nestjs/swagger'
import { Column, DataType, Model, Table } from 'sequelize-typescript'

@Table({ tableName: 'users', underscored: true })
export class User extends Model {
  @Column({
    type: DataType.STRING,
    primaryKey: true,
  })
  @ApiProperty()
  declare id: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  @ApiProperty()
  declare email: string

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  @ApiProperty()
  declare username: string
}
