import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TaskTagsService } from './task-tags.service';
import { TaskTagsController } from './task-tags.controller';
import { TaskTag } from './entities/task-tag.entity';
import { Task } from '../tasks/entities/task.entity';
import { Tag } from '../tags/entities/tag.entity';

@Module({
  imports: [SequelizeModule.forFeature([TaskTag, Task, Tag])],
  controllers: [TaskTagsController],
  providers: [TaskTagsService],
})
export class TaskTagsModule {}