import { Test, TestingModule } from '@nestjs/testing';
import { TaskTagsService } from './task-tags.service';

describe('TaskTagsService', () => {
  let service: TaskTagsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskTagsService],
    }).compile();

    service = module.get<TaskTagsService>(TaskTagsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
