import { BullModule } from '@nestjs/bullmq'
import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { WinstonLogger, WinstonModule } from 'nest-winston'

import { winstonLoggerConfig } from './common/logger'
import configuration from './config'
import { createQueueConfig } from './config/queue.config'
import { HealthModule } from './health/health.module'
import { DatabaseModule } from './infrastructure/database/database.module'
import { AuthModule } from './modules/auth/auth.module'
import { OrdersModule } from './modules/orders/orders.module'
import { OrganizationsModule } from './modules/organizations/organizations.module'
import { PaymentsModule } from './modules/payments/payments.module'
import { UsersModule } from './modules/users/users.module'

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration] }),
    WinstonModule.forRoot(winstonLoggerConfig),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => createQueueConfig(config),
      inject: [ConfigService],
    }),
    CacheModule.register({ isGlobal: true }),
    DatabaseModule,
    HealthModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    OrdersModule,
    PaymentsModule,
  ],
  providers: [WinstonLogger],
})
export class AppModule {}
