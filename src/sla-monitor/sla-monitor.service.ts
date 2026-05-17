import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SlaMonitorService {
  constructor(private prisma: PrismaService) {}

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

          status: {
            not: 'RESOLVED',
          },
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

      console.log(
        `Ticket breached SLA: ${ticket.id}`,
      );
    }
  }
}