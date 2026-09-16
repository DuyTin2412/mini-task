import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role)
    private roleModel: typeof Role,
  ) {}

  create(createRoleDto: CreateRoleDto) {
    return this.roleModel.create({ ...createRoleDto });
  }

  findAll() {
    return this.roleModel.findAll();
  }

  async findOne(id: number) {
    const role = await this.roleModel.findByPk(id);
    if (!role) throw new NotFoundException(`Role ${id} not found`);
    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const role = await this.findOne(id);
    return role.update({ ...updateRoleDto });
  }

  async remove(id: number) {
    const role = await this.findOne(id);
    await role.destroy();
    return { message: `Role ${id} deleted` };
  }
}