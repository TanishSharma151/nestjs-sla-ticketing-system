import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';

import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { AssignTicketDto } from './dto/assign-ticket.dto';

import { calculateSlaDueDate } from 'src/common/utils/calculate-sla-date';

import { Role } from '@prisma/client';



@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) { }

  async createTicket(
    userId: string,
    dto: CreateTicketDto,
  ) {
    const membership =
      await this.prisma.membership.findFirst({
        where: {
          userId,
          orgId: dto.orgId,
        },
      });

    if (!membership) {
      throw new ForbiddenException(
        'Not part of this organization',
      );
    }

    const slaPolicy =
      await this.prisma.slaPolicy.findFirst({
        where: {
          id: dto.slaPolicyId,
          organizationId: dto.orgId,
        },
      });

    if (!slaPolicy) {
      throw new ForbiddenException(
        'Invalid SLA policy',
      );
    }

    const slaDueAt = calculateSlaDueDate(
      slaPolicy.resolutionTimeHours,
    );

    const ticket = await this.prisma.ticket.create({
      data: {
        title: dto.title,
        
        description: dto.description,
        
        attachmentUrl: dto.attachmentUrl,

        priority: dto.priority,

        requesterId: userId,

        orgId: dto.orgId,

        slaPolicyId: slaPolicy.id,
        slaDueAt,
      },
    });

    await this.prisma.ticketEvent.create({
      data: {
        ticketId: ticket.id,
        actorId: userId,
        type: 'CREATED',
      },
    });

    await this.mailService.sendEmail(
      'test@test.com',
      'Ticket Created',
      `
    <div style="font-family:sans-serif;">
      <h2>Ticket Created</h2>

      <p>
        Your ticket has been created.
      </p>

      <p>
        <strong>${ticket.title}</strong>
      </p>

      <a
        href="${process.env.FRONTEND_URL}/tickets/${ticket.id}"
        style="
          display:inline-block;
          margin-top:12px;
          padding:10px 16px;
          background:black;
          color:white;
          text-decoration:none;
          border-radius:8px;
        "
      >
        Track Ticket
      </a>
    </div>
  `,
    );

    return ticket;
  }

  async getTickets(userId: string) {
    const memberships =
      await this.prisma.membership.findMany({
        where: {
          userId,
        },
      });

    const orgIds = memberships.map(
      (membership) => membership.orgId,
    );

    const tickets = await this.prisma.ticket.findMany({
      where: {
        orgId: {
          in: orgIds,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return tickets;
  }

  async updateStatus(
    userId: string,
    ticketId: string,
    dto: UpdateTicketStatusDto,
  ) {
    const ticket =
      await this.prisma.ticket.findUnique({
        where: {
          id: ticketId,
        },

        include: {
          events: {
            include: {
              actor: true,
            },

            orderBy: {
              createdAt: 'desc',
            },
          },

          comments: {
            include: {
              author: true,
            },

            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

    if (!ticket) {
      throw new ForbiddenException(
        'Ticket not found',
      );
    }

    const membership =
      await this.prisma.membership.findFirst({
        where: {
          userId,
          orgId: ticket.orgId,
        },
      });

    if (!membership) {
      throw new ForbiddenException(
        'No access to ticket',
      );
    }

    const updatedTicket =
      await this.prisma.ticket.update({
        where: {
          id: ticketId,
        },
        data: {
          status: dto.status,
        },
      });

    await this.prisma.ticketEvent.create({
      data: {
        ticketId: ticket.id,
        actorId: userId,
        type: 'STATUS_CHANGED',

        metadata: {
          status: dto.status,
        },
      },
    });

    await this.mailService.sendEmail(
      'test@test.com',
      'Ticket Status Updated',
      `
    <div style="font-family:sans-serif;">
      <h2>Ticket Status Updated</h2>

      <p>
        <strong>${ticket.title}</strong>
      </p>

      <p>
        New status:
        <strong>${dto.status}</strong>
      </p>

      <a
        href="${process.env.FRONTEND_URL}/tickets/${ticket.id}"
        style="
          display:inline-block;
          margin-top:12px;
          padding:10px 16px;
          background:black;
          color:white;
          text-decoration:none;
          border-radius:8px;
        "
      >
        View Ticket
      </a>
    </div>
  `,
    );

    return updatedTicket;
  }

  async assignTicket(
    userId: string,
    ticketId: string,
    dto: AssignTicketDto,
  ) {
    const ticket =
      await this.prisma.ticket.findUnique({
        where: {
          id: ticketId,
        },
      });

    if (!ticket) {
      throw new ForbiddenException(
        'Ticket not found',
      );
    }

    const assignerMembership =
      await this.prisma.membership.findFirst({
        where: {
          userId,
          orgId: ticket.orgId,
        },
      });

    if (!assignerMembership) {
      throw new ForbiddenException(
        'No access to organization',
      );
    }

    if (assignerMembership.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'Only admins can assign tickets',
      );
    }

    const assigneeMembership =
      await this.prisma.membership.findFirst({
        where: {
          userId: dto.assigneeUserId,
          orgId: ticket.orgId,
        },
      });

    if (!assigneeMembership) {
      throw new ForbiddenException(
        'Assignee not in organization',
      );
    }

    const updatedTicket =
      await this.prisma.ticket.update({
        where: {
          id: ticketId,
        },
        data: {
          assignedToId: dto.assigneeUserId,
        },
      });

    await this.prisma.ticketEvent.create({
      data: {
        ticketId: ticket.id,
        actorId: userId,
        type: 'ASSIGNED',

        metadata: {
          assignedTo: dto.assigneeUserId,
        },
      },
    });

    const assignee =
      await this.prisma.user.findUnique({
        where: {
          id: dto.assigneeUserId,
        },
      });

    if (assignee) {
      await this.mailService.sendEmail(
        assignee.email,
        'Ticket Assigned',
        `
    <div style="font-family:sans-serif;">
      <h2>Ticket Assigned</h2>

      <p>
        You were assigned a ticket.
      </p>

      <p>
        <strong>Title:</strong>
        ${ticket.title}
      </p>

      <a
        href="${process.env.FRONTEND_URL}/tickets/${ticket.id}"
        style="
          display:inline-block;
          margin-top:12px;
          padding:10px 16px;
          background:black;
          color:white;
          text-decoration:none;
          border-radius:8px;
        "
      >
        Open Ticket
      </a>
    </div>
  `,
      );
    }

    return updatedTicket;
  }

  async getTicketById(
    userId: string,
    ticketId: string,
  ) {
    const ticket =
  await this.prisma.ticket.findUnique({
    where: {
      id: ticketId,
    },

    include: {
      events: {
        include: {
          actor: true,
        },

        orderBy: {
          createdAt: 'desc',
        },
      },

      comments: {
        include: {
          author: true,
        },

        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

    if (!ticket) {
      throw new ForbiddenException(
        'Ticket not found',
      );
    }

    const membership =
      await this.prisma.membership.findFirst({
        where: {
          userId,
          orgId: ticket.orgId,
        },
      });

    if (!membership) {
      throw new ForbiddenException(
        'No access to ticket',
      );
    }

    const isStaff =
      membership.role === 'ADMIN'
      ||
      membership.role === 'AGENT';

    const isRequester =
      ticket.requesterId === userId;

    if (!isStaff && !isRequester) {
      throw new ForbiddenException(
        'No access to ticket',
      );
    }

    return ticket;
  }
  async getMyTickets(
    userId: string,
  ) {
    return this.prisma.ticket.findMany({
      where: {
        requester: {
          id: userId,
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}