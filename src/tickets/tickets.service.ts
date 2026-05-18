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
  ) {}

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
        priority: dto.priority,

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
        <h2>Ticket Created</h2>
        <p>${ticket.title}</p>
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
        <h2>Status Changed</h2>
        <p>${dto.status}</p>
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
          <h2>Ticket Assigned</h2>
          <p>${ticket.title}</p>
        `,
      );
    }

    return updatedTicket;
  }
}