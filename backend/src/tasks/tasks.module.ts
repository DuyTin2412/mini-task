import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './entities/task.entity';
import { Project } from '../projects/entities/project.entity';
import { User } from '../users/entities/user.entity';
import { ProjectMember } from '../project-members/entities/project-member.entity';

@Module({
  imports: [SequelizeModule.forFeature([Task, Project, User, ProjectMember])],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}