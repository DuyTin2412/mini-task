import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  findAll(@CurrentUser() user: { userId: number }) {
    return this.projectsService.findAllForUser(user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: { userId: number }) {
    return this.projectsService.findOne(+id, user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser() user: { userId: number },
  ) {
    return this.projectsService.update(+id, updateProjectDto, user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: { userId: number }) {
    return this.projectsService.remove(+id, user.userId);
  }
  @Get(':id/detail')
    getDetail(@Param('id') id: string, @CurrentUser() user: { userId: number }) {
  return this.projectsService.getProjectDetail(+id, user.userId);
}
}