import {
  IsEnum,
  IsInt,
  IsString,
  Min,
} from 'class-validator';

import { TicketPriority } from '@prisma/client';

export class CreateSlaPolicyDto {
  @IsString()
  name!: string;

  @IsEnum(TicketPriority)
  priority!: TicketPriority;

  @IsInt()
  @Min(1)
  responseTimeHours!: number;

  @IsInt()
  @Min(1)
  resolutionTimeHours!: number;

  @IsString()
  organizationId!: string;
}