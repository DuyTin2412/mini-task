import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { Comment } from './entities/comment.entity';
import { Task } from '../tasks/entities/task.entity';
import { User } from '../users/entities/user.entity';
import { Project } from '../projects/entities/project.entity';
import { ProjectMember } from '../project-members/entities/project-member.entity';

@Module({
  imports: [SequelizeModule.forFeature([Comment, Task, User, Project, ProjectMember])],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}