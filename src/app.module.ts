import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { TicketsModule } from './tickets/tickets.module';
import { SlaModule } from './sla/sla.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { SlaMonitorService } from './sla-monitor/sla-monitor.service';
import { MailModule } from './mail/mail.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    ScheduleModule.forRoot(),

    PrismaModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    TicketsModule,
    SlaModule,
    MailModule,
  ],

  controllers: [AppController],
  providers: [AppService, SlaMonitorService],
})
export class AppModule {}