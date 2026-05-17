import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

import { CreateSlaPolicyDto } from './dto/create-sla-policy.dto';

import { Role } from '@prisma/client';

@Injectable()
export class SlaService {
  constructor(private prisma: PrismaService) {}

  async createPolicy(
    userId: string,
    dto: CreateSlaPolicyDto,
  ) {
    const membership =
      await this.prisma.membership.findFirst({
        where: {
          userId,
          orgId: dto.organizationId,
        },
      });

    if (!membership) {
      throw new ForbiddenException(
        'Not part of organization',
      );
    }

    if (membership.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'Only admins can create SLA policies',
      );
    }

    const policy =
      await this.prisma.slaPolicy.create({
        data: {
          name: dto.name,
          priority: dto.priority,
          responseTimeHours:
            dto.responseTimeHours,
          resolutionTimeHours:
            dto.resolutionTimeHours,
          organizationId: dto.organizationId,
        },
      });

    return policy;
  }
}