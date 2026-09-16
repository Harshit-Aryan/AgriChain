import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { FarmersModule } from './farmers/farmers.module';
import { BuyersModule } from './buyers/buyers.module';
import { MatchingModule } from './matching/matching.module';
import { OrdersModule } from './orders/orders.module';
import { LogisticsModule } from './logistics/logistics.module';
import { RoutesModule } from './routes/routes.module';
import { ForecastModule } from './forecast/forecast.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    ProductsModule,
    FarmersModule,
    BuyersModule,
    MatchingModule,
    OrdersModule,
    LogisticsModule,
    RoutesModule,
    ForecastModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
