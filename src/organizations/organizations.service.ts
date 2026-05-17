import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrgDto } from './dto/create-org.dto';
import { Role } from '@prisma/client';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

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
}