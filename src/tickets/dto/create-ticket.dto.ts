import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TicketPriority } from '@prisma/client';

export class CreateTicketDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(TicketPriority)
  priority!: TicketPriority;

  @IsString()
  orgId!: string;

  @IsString()
  slaPolicyId!: string;
}