import { IsISO8601 } from 'class-validator';

export class UpdateSlaDto {
  @IsISO8601()
  slaDueAt!: string;
}
