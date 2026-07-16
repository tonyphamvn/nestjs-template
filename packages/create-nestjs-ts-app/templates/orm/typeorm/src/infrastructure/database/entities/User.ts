import { ApiProperty } from '@nestjs/swagger'
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity({ name: 'users' })
export class User {
  @PrimaryColumn()
  @ApiProperty()
  id!: string

  @Column()
  @ApiProperty()
  email!: string

  @Column()
  @ApiProperty()
  username!: string

  @CreateDateColumn({ type: 'timestamptz' })
  @ApiProperty()
  createdAt!: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  @ApiProperty()
  updatedAt!: Date
}
