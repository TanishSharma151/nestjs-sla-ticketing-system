import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard }
  from 'src/auth/guards/jwt-auth.guard';

import { RolesGuard }
  from 'src/auth/guards/roles.guard';

import { Roles }
  from 'src/auth/decorators/roles.decorator';

import { SlaService }
  from './sla.service';

import { CreateSlaPolicyDto }
  from './dto/create-sla-policy.dto';

@Controller('sla')
export class SlaController {
  constructor(
    private slaService: SlaService,
  ) {}

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles('ADMIN')
  @Post()
  createPolicy(
    @Req() req: any,

    @Body()
    dto: CreateSlaPolicyDto,
  ) {
    return this.slaService.createPolicy(
      req.user.userId,
      dto,
    );
  }

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles('ADMIN', 'AGENT')
  @Get(':organizationId')
  getPolicies(
    @Req() req: any,

    @Param('organizationId')
    organizationId: string,
  ) {
    return this.slaService.getPolicies(
      req.user.userId,
      organizationId,
    );
  }
}