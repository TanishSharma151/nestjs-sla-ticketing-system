import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

import { SlaService } from './sla.service';
import { CreateSlaPolicyDto } from './dto/create-sla-policy.dto';

@Controller('sla-policies')
export class SlaController {
  constructor(private slaService: SlaService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createPolicy(
    @Req() req: any,
    @Body() dto: CreateSlaPolicyDto,
  ) {
    return this.slaService.createPolicy(
      req.user.userId,
      dto,
    );
  }
}