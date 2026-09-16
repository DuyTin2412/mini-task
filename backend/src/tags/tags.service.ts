import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Tag } from './entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectModel(Tag)
    private tagModel: typeof Tag,
  ) {}

  create(createTagDto: CreateTagDto) {
    return this.tagModel.create({ ...createTagDto });
  }

  findAll() {
    return this.tagModel.findAll();
  }

  async findOne(id: number) {
    const tag = await this.tagModel.findByPk(id);
    if (!tag) throw new NotFoundException(`Tag ${id} not found`);
    return tag;
  }

  async update(id: number, updateTagDto: UpdateTagDto) {
    const tag = await this.findOne(id);
    return tag.update({ ...updateTagDto });
  }

  async remove(id: number) {
    const tag = await this.findOne(id);
    await tag.destroy();
    return { message: `Tag ${id} deleted` };
  }
}