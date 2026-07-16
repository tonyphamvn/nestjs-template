import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common'
import { HttpCodeMessages } from '@src/shared/constants'
import { FastifyReply, FastifyRequest } from 'fastify'
import { WinstonLogger } from 'nest-winston'

import { ResponseDto } from '../dto'

@Catch()
export class CommonExceptionFilter<T = any> implements ExceptionFilter<T> {
  constructor(private logger: WinstonLogger) {}

  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const req = ctx.getRequest<FastifyRequest>()
    const res = ctx.getResponse<FastifyReply>()

    const { method, url, ip, body } = req

    let statusCode = 500
    let error = 'Internal server error'
    let message: string | string[] = 'Internal server error'

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus()
      error = exception.message
      const response = exception.getResponse() as { message: string }
      message =
        response.message ||
        HttpCodeMessages[statusCode] ||
        'Internal server error'
    }

    const logMessage = `${method} ${url} ${statusCode} - ${ip} - body ${JSON.stringify(body || {})} - ${message}`
    if (statusCode >= 500) {
      this.logger.error(logMessage)
    } else {
      this.logger.warn(logMessage)
    }

    return res.status(statusCode).send(
      new ResponseDto({
        success: false,
        statusCode,
        error,
        message,
      }),
    )
  }
}
