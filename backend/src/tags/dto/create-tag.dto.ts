import { IsString, IsOptional } from 'class-validator';

export class CreateTagDto {
  @IsString()
  projectName: string;

  @IsOptional()
  @IsString()
  color?: string;
}