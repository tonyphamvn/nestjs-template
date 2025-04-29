import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common'
import { FastifyReply, FastifyRequest } from 'fastify'
import { WinstonLogger } from 'nest-winston'

import { ResponseDto } from '../dto'

@Catch(HttpException)
export class HttpExceptionFilter<T extends HttpException>
  implements ExceptionFilter
{
  constructor(private readonly logger: WinstonLogger) {}

  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const req = ctx.getRequest<FastifyRequest>()
    const res = ctx.getResponse<FastifyReply>()
    const statusCode = exception.getStatus()
    const exceptionResponse = exception.getResponse()

    const { method, url, ip, body } = req

    const error: any =
      typeof res === 'string'
        ? {
            statusCode,
            error: exceptionResponse,
            message: exceptionResponse,
          }
        : (exceptionResponse as object)

    if (error.message === 'Cannot GET /' && error.error === 'Not Found') {
      return res.redirect('/api/v1/health')
    }

    const message =
      typeof exceptionResponse === 'string' ? exceptionResponse : error.message

    this.logger.error(
      `[HTTP] ${method} ${url} ${statusCode} - ${ip} - body ${JSON.stringify(body || {})} - ${message}`,
    )

    return res.status(statusCode).send(
      new ResponseDto({
        success: false,
        statusCode,
        error:
          typeof exceptionResponse === 'string' ? 'HTTPError' : error.error,
        message,
      }),
    )
  }
}
