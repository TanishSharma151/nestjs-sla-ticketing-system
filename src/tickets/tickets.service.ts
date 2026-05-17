import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { calculateSlaDueDate } from 'src/common/utils/calculate-sla-date';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { Role } from '@prisma/client';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) { }

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

    return updatedTicket;
  }
}