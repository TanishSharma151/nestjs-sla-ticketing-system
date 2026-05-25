import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  Get,
  Param,
  Patch,
} from '@nestjs/common';

import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OrganizationsService } from './organizations.service';
import { CreateOrgDto } from './dto/create-org.dto';

@Controller('organizations')
export class OrganizationsController {
  constructor(
    private organizationsService: OrganizationsService,
  ) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  createOrg(@Req() req: any, @Body() dto: CreateOrgDto) {
    return this.organizationsService.createOrg(
      req.user.userId,
      dto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':orgId/members')
  getMembers(
    @Req() req: any,
    @Param('orgId') orgId: string,
  ) {
    return this.organizationsService.getMembers(
      req.user.userId,
      orgId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':orgId/members/:memberId')
  updateMemberRole(
    @Req() req: any,

    @Param('orgId') orgId: string,

    @Param('memberId') memberId: string,

    @Body() dto: UpdateRoleDto,
  ) {
    return this.organizationsService.updateMemberRole(
      req.user.userId,
      orgId,
      memberId,
      dto,
    );
  }
}