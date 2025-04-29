import { WinstonLogger, WinstonModule } from 'nest-winston'
import winston from 'winston'
import 'winston-daily-rotate-file'

const colorize = (message: unknown) => {
  return {
    info: `\x1b[32m${message}\x1b[0m`, // Green
    log: `\x1b[32m${message}\x1b[0m`, // Green
    warn: `\x1b[33m${message}\x1b[0m`, // Yellow
    error: `\x1b[31m${message}\x1b[0m`, // Red
    debug: `\x1b[36m${message}\x1b[0m`, // Cyan
  }
}

export const winstonFormatLog = winston.format.combine(
  winston.format.timestamp({ format: 'MM/DD/YYYY, HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message }) => {
    if ((message as string).includes('/favicon.ico')) return ''
    return `${timestamp} ${colorize(`[${level.toUpperCase()}]`)[level]}: ${colorize(message)[level]}`
  }),
)

export const winstonLoggerConfig = winston.createLogger({
  level: 'info',
  format: winstonFormatLog,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      zippedArchive: true,
    }),
    new winston.transports.DailyRotateFile({
      filename: `logs/rotate/%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '25m',
    }),
  ],
})

export const logger = WinstonModule.createLogger({
  instance: winstonLoggerConfig,
}) as WinstonLogger

export const winstonScannerLoggerConfig = winston.createLogger({
  level: 'info',
  format: winstonFormatLog,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: 'logs/process.log',
      zippedArchive: true,
    }),
  ],
})

export const scannerLogger = WinstonModule.createLogger({
  instance: winstonScannerLoggerConfig,
}) as WinstonLogger
