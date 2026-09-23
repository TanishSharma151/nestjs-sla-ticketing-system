import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SlaMonitorService {
  constructor(
    private prisma: PrismaService,
  ) {}

  @Cron('*/30 * * * * *')
  async checkSlaBreaches() {
    const now = new Date();

    const breachedTickets =
      await this.prisma.ticket.findMany({
        where: {
          isBreached: false,

          slaDueAt: {
            lt: now,
          },

          // Only OPEN tickets have a running SLA clock -
          // anything else (IN_PROGRESS, etc.) is paused,
          // and RESOLVED/CLOSED are terminal.
          status: 'OPEN',
        },
      });

    for (const ticket of breachedTickets) {
      await this.prisma.ticket.update({
        where: {
          id: ticket.id,
        },

        data: {
          isBreached: true,
        },
      });

      await this.prisma.ticketEvent.create({
        data: {
          ticketId: ticket.id,

          type: 'SLA_BREACHED',
        },
      });
    }
  }
}