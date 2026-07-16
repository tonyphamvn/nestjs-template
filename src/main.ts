import fastifyCompress from '@fastify/compress'
import fastifyCsrf from '@fastify/csrf-protection'
import fastifyHelmet from '@fastify/helmet'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { AppModule } from './app.module'
import { CommonExceptionFilter } from './common/exception-filters'
import {
  HttpExceptionFilter,
  ResponseInterceptor,
} from './common/interceptors'
import { logger } from './common/logger'

async function bootstrap() {
  const adapter = new FastifyAdapter()
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
  )

  // Security
  await app.register(fastifyHelmet as any)
  await app.register(fastifyCsrf as any)
  await app.register(fastifyCompress as any)

  app.useLogger(logger)
  app.flushLogs()

  app.enableCors({
    origin: true,
    credentials: true,
    exposedHeaders: ['set-cookie'],
  })

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      stopAtFirstError: true,
    }),
  )

  // Exception Filter
  app.useGlobalFilters(
    new CommonExceptionFilter(logger),
    new HttpExceptionFilter(logger),
  )

  // Interceptor
  app.useGlobalInterceptors(new ResponseInterceptor(logger))

  // Set global prefix
  app.setGlobalPrefix('api/v1')

  // Set API swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('API docs')
    .setDescription(
      'The API endpoints for managing and interacting with the system.',
    )
    .setVersion('1.0')
    .build()
  const documentFactory = () => SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('api', app, documentFactory)

  const config = app.get(ConfigService)
  const APP_PORT = config.get<number>('APP_PORT', 8000)

  await app.listen(APP_PORT, '0.0.0.0', () => {
    logger.log(`Listening for HTTP on port ${APP_PORT}`)
  })

  const silentError = (err: unknown) => logger.error(err)
  process.on('unhandledRejection', silentError)
  process.on('uncaughtException', silentError)
}
bootstrap()
