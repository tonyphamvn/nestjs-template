import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { WinstonLogger } from 'nest-winston'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { ResponseDto } from '../dto'

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(@Inject('winston') private readonly logger: WinstonLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest()
    const { method, url, ip, body } = req
    const start = Date.now()

    return next.handle().pipe(
      map((data) => {
        const res = context.switchToHttp().getResponse()
        const duration = Date.now() - start
        const { statusCode } = res

        this.logger.log(
          `${method} ${url} ${statusCode} - ${duration}ms - ${ip} - body ${JSON.stringify(body || {})}`,
        )

        return new ResponseDto({ data })
      }),
    )
  }
}
