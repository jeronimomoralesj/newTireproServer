import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TireModule } from '../tire/tire.module';
import { CompanyModule } from '../company/company.module';
import { UserModule } from '../user/user.module';
import { EmailModule } from '../email/email.module';
import { VehicleModule } from '../vehicle/vehicle.module';
import { TireInspectionModule } from '../tire-inspection/tire-inspection.module';
import { TireCostModule } from '../tire-cost/tire-cost.module';
import { TireConditionModule } from '../tire-condition-change/tire-condition.module';
import { NotificationModule } from '../notification/notification.module';
import { AuthModule } from '../auth/auth.module';
import { IncomeModule } from '../income/income.module';
import { TripModule } from '../trip/trip.module';
import { ExtraModule } from '../extra/extra.module';

@Module({
  imports: [
    TireModule,
    CompanyModule,
    UserModule,
    EmailModule,
    VehicleModule,
    TireInspectionModule,
    TireCostModule,
    TireConditionModule,
    NotificationModule,
    AuthModule,
    IncomeModule,
    TripModule,
    ExtraModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
