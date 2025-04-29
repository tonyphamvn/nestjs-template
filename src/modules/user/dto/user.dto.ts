import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class VerifySignatureDto {
  @ApiProperty({ required: true })
  @IsString()
  signedMessage!: string

  @ApiProperty({ required: true })
  @IsString()
  signature!: string

  @ApiProperty({ required: true })
  @IsString()
  address!: string
}
