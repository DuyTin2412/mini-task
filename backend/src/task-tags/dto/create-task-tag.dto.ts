import { IsInt } from 'class-validator';

export class CreateTaskTagDto {
  @IsInt()
  taskId: number;

  @IsInt()
  tagId: number;
}