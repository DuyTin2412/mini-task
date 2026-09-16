import { Test, TestingModule } from '@nestjs/testing';
import { TaskTagsController } from './task-tags.controller';
import { TaskTagsService } from './task-tags.service';

describe('TaskTagsController', () => {
  let controller: TaskTagsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskTagsController],
      providers: [TaskTagsService],
    }).compile();

    controller = module.get<TaskTagsController>(TaskTagsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
