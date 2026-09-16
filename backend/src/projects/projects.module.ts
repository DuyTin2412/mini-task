import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Project } from './entities/project.entity';
import { User } from '../users/entities/user.entity';
import { ProjectMember } from '../project-members/entities/project-member.entity';

@Module({
  imports: [SequelizeModule.forFeature([Project, User, ProjectMember])],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}