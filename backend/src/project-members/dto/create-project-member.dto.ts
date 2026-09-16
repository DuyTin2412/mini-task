import { IsInt, IsEmail } from 'class-validator';

export class CreateProjectMemberDto {
  @IsInt()
  projectId: number;

  @IsEmail()
  email: string;

  @IsInt()
  roleId: number;
}