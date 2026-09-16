import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Comment } from './entities/comment.entity';
import { Task } from '../tasks/entities/task.entity';
import { User } from '../users/entities/user.entity';
import { Project } from '../projects/entities/project.entity';
import { ProjectMember } from '../project-members/entities/project-member.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment)
    private commentModel: typeof Comment,
    @InjectModel(Task)
    private taskModel: typeof Task,
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(Project)
    private projectModel: typeof Project,
    @InjectModel(ProjectMember)
    private projectMemberModel: typeof ProjectMember,
  ) {}

  private async hasTaskAccess(taskId: number, userId: number): Promise<Task> {
    const task = await this.taskModel.findByPk(taskId);
    if (!task) {
      throw new NotFoundException(`Task ${taskId} not found`);
    }

    const project = await this.projectModel.findByPk(task.projectId);
    if (!project) {
      throw new NotFoundException(`Project của task này không tồn tại`);
    }

    if (project.ownerId === userId) return task;

    const membership = await this.projectMemberModel.findOne({
      where: { projectId: project.id, userId, status: 'accepted' },
    });
    if (!membership) {
      throw new ForbiddenException('Bạn không có quyền truy cập task này');
    }

    return task;
  }

  async create(createCommentDto: CreateCommentDto, userId: number) {
    await this.hasTaskAccess(createCommentDto.taskId, userId);

    const user = await this.userModel.findByPk(createCommentDto.userId);
    if (!user) {
      throw new BadRequestException(`user with id ${createCommentDto.userId} does not exist`);
    }

    return this.commentModel.create({ ...createCommentDto });
  }

  async findAllForUser(userId: number) {
    const ownedProjects = await this.projectModel.findAll({ where: { ownerId: userId } });
    const ownedProjectIds = ownedProjects.map((p) => p.id);

    const acceptedMemberships = await this.projectMemberModel.findAll({
      where: { userId, status: 'accepted' },
    });
    const memberProjectIds = acceptedMemberships.map((m) => m.projectId);

    const accessibleProjectIds = [...new Set([...ownedProjectIds, ...memberProjectIds])];

    const accessibleTasks = await this.taskModel.findAll({
      where: { projectId: accessibleProjectIds.length > 0 ? accessibleProjectIds : [-1] },
    });
    const accessibleTaskIds = accessibleTasks.map((t) => t.id);

    return this.commentModel.findAll({
      where: { taskId: accessibleTaskIds.length > 0 ? accessibleTaskIds : [-1] },
    });
  }

  async findOne(id: number, userId: number) {
    const comment = await this.commentModel.findByPk(id);
    if (!comment) throw new NotFoundException(`Comment ${id} not found`);

    await this.hasTaskAccess(comment.taskId, userId);
    return comment;
  }

  async update(id: number, updateCommentDto: UpdateCommentDto, userId: number) {
    const comment = await this.findOne(id, userId); 

    if (updateCommentDto.taskId) {
      await this.hasTaskAccess(updateCommentDto.taskId, userId);
    }

    if (updateCommentDto.userId) {
      const user = await this.userModel.findByPk(updateCommentDto.userId);
      if (!user) {
        throw new BadRequestException(`user with id ${updateCommentDto.userId} does not exist`);
      }
    }

    return comment.update({ ...updateCommentDto });
  }

  async remove(id: number, userId: number) {
    const comment = await this.findOne(id, userId); 
    await comment.destroy();
    return { message: `Comment ${id} deleted` };
  }
}