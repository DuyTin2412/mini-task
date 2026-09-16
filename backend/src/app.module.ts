import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { TagsModule } from './tags/tags.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { CommentsModule } from './comments/comments.module';
import { TaskTagsModule } from './task-tags/task-tags.module';
import { ProjectMembersModule } from './project-members/project-members.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule, 
    UsersModule,
    RolesModule,
    TagsModule,
    ProjectsModule,
    TasksModule,
    CommentsModule,
    TaskTagsModule,
    ProjectMembersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}