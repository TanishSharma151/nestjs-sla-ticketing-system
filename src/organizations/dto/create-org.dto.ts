import {
  IsString,
  MinLength,
} from 'class-validator';

export class CreateOrgDto {
  @IsString()
  @MinLength(3)
  name!: string;
}