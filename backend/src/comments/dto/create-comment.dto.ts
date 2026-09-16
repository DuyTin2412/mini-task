import { IsString, IsInt } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  comment: string;

  @IsInt()
  taskId: number;

  @IsInt()
  userId: number;
}