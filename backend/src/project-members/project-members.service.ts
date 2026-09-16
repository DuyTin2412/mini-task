import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ProjectMember } from './entities/project-member.entity';
import { Project } from '../projects/entities/project.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { CreateProjectMemberDto } from './dto/create-project-member.dto';
import { UpdateProjectMemberDto } from './dto/update-project-member.dto';

@Injectable()
export class ProjectMembersService {
  constructor(
    @InjectModel(ProjectMember)
    private projectMemberModel: typeof ProjectMember,
    @InjectModel(Project)
    private projectModel: typeof Project,
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(Role)
    private roleModel: typeof Role,
  ) {}

  async create(createProjectMemberDto: CreateProjectMemberDto) {
    const project = await this.projectModel.findByPk(createProjectMemberDto.projectId);
    if (!project) {
      throw new BadRequestException(`Project ${createProjectMemberDto.projectId} không tồn tại`);
    }

    const user = await this.userModel.findOne({
      where: { email: createProjectMemberDto.email },
    });
    if (!user) {
      throw new BadRequestException(`Không tìm thấy user với email ${createProjectMemberDto.email}`);
    }

    const role = await this.roleModel.findByPk(createProjectMemberDto.roleId);
    if (!role) {
      throw new BadRequestException(`Role ${createProjectMemberDto.roleId} không tồn tại`);
    }

    return this.projectMemberModel.create({
      projectId: createProjectMemberDto.projectId,
      userId: user.id,
      roleId: createProjectMemberDto.roleId,
      status: 'pending',
    });
  }

  findAll() {
    return this.projectMemberModel.findAll();
  }

  async findOne(id: number) {
    const member = await this.projectMemberModel.findByPk(id);
    if (!member) throw new NotFoundException(`ProjectMember ${id} not found`);
    return member;
  }

  findMembersByProjectId(projectId: number) {
    return this.projectMemberModel.findAll({ where: { projectId } });
  }

  // Lấy lời mời đang pending của 1 user cụ thể
  findPendingInvitesByUserId(userId: number) {
    return this.projectMemberModel.findAll({
      where: { userId, status: 'pending' },
    });
  }

  async update(id: number, updateProjectMemberDto: UpdateProjectMemberDto) {
    const member = await this.findOne(id);
    return member.update({ ...updateProjectMemberDto });
  }

  async remove(id: number) {
    const member = await this.findOne(id);
    await member.destroy();
    return { message: `ProjectMember ${id} deleted` };
  }
}