import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TaskTagsService } from './task-tags.service';
import { CreateTaskTagDto } from './dto/create-task-tag.dto';
import { UpdateTaskTagDto } from './dto/update-task-tag.dto';

@Controller('task-tags')
export class TaskTagsController {
  constructor(private readonly taskTagsService: TaskTagsService) {}

  @Post()
  create(@Body() createTaskTagDto: CreateTaskTagDto) {
    return this.taskTagsService.create(createTaskTagDto);
  }

  @Get()
  findAll() {
    return this.taskTagsService.findAll();
  }

  @Get('task/:taskId')
  findByTask(@Param('taskId') taskId: string) {
    return this.taskTagsService.findTagsByTaskId(+taskId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.taskTagsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskTagDto: UpdateTaskTagDto) {
    return this.taskTagsService.update(+id, updateTaskTagDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.taskTagsService.remove(+id);
  }
}