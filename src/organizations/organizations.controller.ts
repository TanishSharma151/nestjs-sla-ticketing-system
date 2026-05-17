import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OrganizationsService } from './organizations.service';
import { CreateOrgDto } from './dto/create-org.dto';

@Controller('organizations')
export class OrganizationsController {
  constructor(
    private organizationsService: OrganizationsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createOrg(@Req() req: any, @Body() dto: CreateOrgDto) {
    return this.organizationsService.createOrg(
      req.user.userId,
      dto,
    );
  }
}