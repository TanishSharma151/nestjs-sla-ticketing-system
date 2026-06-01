import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { MailModule } from 'src/mail/mail.module';
import { SlaMonitorService } from './sla-monitor.service';

@Module({
  imports: [MailModule],
  controllers: [TicketsController],
  providers: [TicketsService, SlaMonitorService]
})
export class TicketsModule {}
