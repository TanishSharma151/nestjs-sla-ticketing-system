import {
  Injectable,
  ForbiddenException
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrgDto } from './dto/create-org.dto';
import { Role } from '@prisma/client';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) { }

  async createOrg(userId: string, dto: CreateOrgDto) {
    const organization =
      await this.prisma.organization.create({
        data: {
          name: dto.name,

          memberships: {
            create: {
              userId,
              role: Role.ADMIN,
            },
          },
        },
        include: {
          memberships: true,
        },
      });

    return organization;
  }

  async getMembers(
    userId: string,
    orgId: string,
  ) {
    const membership =
      await this.prisma.membership.findFirst({
        where: {
          userId,
          orgId,
        },
      });

    if (!membership) {
      throw new ForbiddenException(
        'No access',
      );
    }

    return this.prisma.membership.findMany({
      where: {
        orgId,
      },

      include: {
        user: true,
      },
    });
  }

  async updateMemberRole(
    userId: string,

    orgId: string,

    memberId: string,

    dto: UpdateRoleDto,
  ) {
    const membership =
      await this.prisma.membership.findFirst({
        where: {
          userId,
          orgId,
        },
      });

    if (!membership) {
      throw new ForbiddenException(
        'No access',
      );
    }

    if (membership.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Admins only',
      );
    }

    return this.prisma.membership.update({
      where: {
        id: memberId,
      },

      data: {
        role: dto.role,
      },
    });
  }
}