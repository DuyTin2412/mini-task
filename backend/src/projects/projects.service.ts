import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Project } from './entities/project.entity';
import { User } from '../users/entities/user.entity';
import { ProjectMember } from '../project-members/entities/project-member.entity';
import { Task } from '../tasks/entities/task.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project)
    private projectModel: typeof Project,
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(ProjectMember)
    private projectMemberModel: typeof ProjectMember,
    @InjectModel(Task)
    private taskModel: typeof Task,
  ) {}

  async create(createProjectDto: CreateProjectDto) {
    const owner = await this.userModel.findByPk(createProjectDto.ownerId);
    if (!owner) {
      throw new BadRequestException(`user with id ${createProjectDto.ownerId} does not exist`);
    }
    return this.projectModel.create({ ...createProjectDto });
  }

  async findAllForUser(userId: number) {
    const acceptedMemberships = await this.projectMemberModel.findAll({
      where: { userId, status: 'accepted' },
    });
    const memberProjectIds = acceptedMemberships.map((m) => m.projectId);

    return this.projectModel.findAll({
      where: {
        [Op.or]: [
          { ownerId: userId },
          { id: memberProjectIds.length > 0 ? memberProjectIds : [-1] },
        ],
      },
    });
  }

  private async checkAccess(projectId: number, userId: number) {
    const project = await this.projectModel.findByPk(projectId);
    if (!project) throw new NotFoundException(`Project ${projectId} not found`);

    if (project.ownerId === userId) return project;

    const membership = await this.projectMemberModel.findOne({
      where: { projectId, userId, status: 'accepted' },
    });
    if (!membership) {
      throw new ForbiddenException('Bạn không có quyền truy cập project này');
    }

    return project;
  }

  async findOne(id: number, userId: number) {
    return this.checkAccess(id, userId);
  }

  async update(id: number, updateProjectDto: UpdateProjectDto, userId: number) {
    const project = await this.checkAccess(id, userId);
    if (project.ownerId !== userId) {
      throw new ForbiddenException('Chỉ owner mới được sửa project');
    }

    if (updateProjectDto.ownerId) {
      const owner = await this.userModel.findByPk(updateProjectDto.ownerId);
      if (!owner) {
        throw new BadRequestException(`user with id ${updateProjectDto.ownerId} does not exist`);
      }
    }

    return project.update({ ...updateProjectDto });
  }

  async remove(id: number, userId: number) {
    const project = await this.checkAccess(id, userId);

    if (project.ownerId !== userId) {
      throw new ForbiddenException('Chỉ owner mới được xóa project');
    }

    await project.destroy();
    return { message: `Project ${id} deleted` };
  }

  async getProjectDetail(id: number, userId: number) {
    const project = await this.checkAccess(id, userId);
    const tasks = await this.taskModel.findAll({ where: { projectId: id } });
    const members = await this.projectMemberModel.findAll({
      where: { projectId: id, status: 'accepted' },
    });
    return {
      ...project.toJSON(),
      tasks,
      members,
    };
  }
}