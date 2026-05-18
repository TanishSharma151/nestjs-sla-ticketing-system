import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [TicketsController],
  providers: [TicketsService]
})
export class TicketsModule {}
