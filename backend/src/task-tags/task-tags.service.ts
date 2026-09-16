import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TaskTag } from './entities/task-tag.entity';
import { Task } from '../tasks/entities/task.entity';
import { Tag } from '../tags/entities/tag.entity';
import { CreateTaskTagDto } from './dto/create-task-tag.dto';
import { UpdateTaskTagDto } from './dto/update-task-tag.dto';

@Injectable()
export class TaskTagsService {
  constructor(
    @InjectModel(TaskTag)
    private taskTagModel: typeof TaskTag,
    @InjectModel(Task)
    private taskModel: typeof Task,
    @InjectModel(Tag)
    private tagModel: typeof Tag,
  ) {}

  async create(createTaskTagDto: CreateTaskTagDto) {
    const task = await this.taskModel.findByPk(createTaskTagDto.taskId);
    if (!task) {
      throw new BadRequestException(
        `task with id ${createTaskTagDto.taskId} does not exist`,
      );
    }

    const tag = await this.tagModel.findByPk(createTaskTagDto.tagId);
    if (!tag) {
      throw new BadRequestException(
        `tag with id ${createTaskTagDto.tagId} does not exist`,
      );
    }

    return this.taskTagModel.create({ ...createTaskTagDto });
  }

  findAll() {
    return this.taskTagModel.findAll();
  }

  async findOne(id: number) {
    const taskTag = await this.taskTagModel.findByPk(id);
    if (!taskTag) throw new NotFoundException(`TaskTag ${id} not found`);
    return taskTag;
  }

  findTagsByTaskId(taskId: number) {
    return this.taskTagModel.findAll({ where: { taskId } });
  }

  async update(id: number, updateTaskTagDto: UpdateTaskTagDto) {
    const taskTag = await this.findOne(id);
    return taskTag.update({ ...updateTaskTagDto });
  }

  async remove(id: number) {
    const taskTag = await this.findOne(id);
    await taskTag.destroy();
    return { message: `TaskTag ${id} deleted` };
  }
}