import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Task } from './entities/task.entity';
import { Project } from '../projects/entities/project.entity';
import { User } from '../users/entities/user.entity';
import { ProjectMember } from '../project-members/entities/project-member.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task)
    private taskModel: typeof Task,
    @InjectModel(Project)
    private projectModel: typeof Project,
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(ProjectMember)
    private projectMemberModel: typeof ProjectMember,
  ) {}

  private async hasProjectAccess(projectId: number, userId: number) {
    const project = await this.projectModel.findByPk(projectId);
    if (!project) return false;
    if (project.ownerId === userId) return true;

    const membership = await this.projectMemberModel.findOne({
      where: { projectId, userId, status: 'accepted' },
    });
    return !!membership;
  }

  async create(createTaskDto: CreateTaskDto, userId: number) {
    const project = await this.projectModel.findByPk(createTaskDto.projectId);
    if (!project) {
      throw new BadRequestException(`project with id ${createTaskDto.projectId} does not exist`);
    }

    const hasAccess = await this.hasProjectAccess(createTaskDto.projectId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('Bạn không có quyền tạo task trong project này');
    }

    if (createTaskDto.assigneeId) {
      const assignee = await this.userModel.findByPk(createTaskDto.assigneeId);
      if (!assignee) {
        throw new BadRequestException(`user with id ${createTaskDto.assigneeId} does not exist`);
      }
    }

    return this.taskModel.create({ ...createTaskDto });
  }

  async findAllForUser(userId: number) {
    const acceptedMemberships = await this.projectMemberModel.findAll({
      where: { userId, status: 'accepted' },
    });
    const memberProjectIds = acceptedMemberships.map((m) => m.projectId);

    const ownedProjects = await this.projectModel.findAll({ where: { ownerId: userId } });
    const ownedProjectIds = ownedProjects.map((p) => p.id);

    const accessibleProjectIds = [...new Set([...memberProjectIds, ...ownedProjectIds])];

    return this.taskModel.findAll({
      where: { projectId: accessibleProjectIds.length > 0 ? accessibleProjectIds : [-1] },
    });
  }

  async findOne(id: number, userId: number) {
    const task = await this.taskModel.findByPk(id);
    if (!task) throw new NotFoundException(`Task ${id} not found`);

    const hasAccess = await this.hasProjectAccess(task.projectId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('Bạn không có quyền xem task này');
    }

    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, userId: number) {
    const task = await this.findOne(id, userId);

    if (updateTaskDto.projectId) {
      const project = await this.projectModel.findByPk(updateTaskDto.projectId);
      if (!project) {
        throw new BadRequestException(`project with id ${updateTaskDto.projectId} does not exist`);
      }
    }

    if (updateTaskDto.assigneeId) {
      const assignee = await this.userModel.findByPk(updateTaskDto.assigneeId);
      if (!assignee) {
        throw new BadRequestException(`user with id ${updateTaskDto.assigneeId} does not exist`);
      }
    }

    return task.update({ ...updateTaskDto });
  }

  async remove(id: number, userId: number) {
    const task = await this.findOne(id, userId); 
    await task.destroy();
    return { message: `Task ${id} deleted` };
  }
}