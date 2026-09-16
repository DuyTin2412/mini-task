import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'project_members',
  timestamps: true,
  underscored: true,
})
export class ProjectMember extends Model {
  @Column({ type: DataType.INTEGER, allowNull: false })
  projectId: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  userId: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  roleId: number;

  @Column({
    type: DataType.ENUM('pending', 'accepted', 'declined'),
    allowNull: false,
    defaultValue: 'pending',
  })
  status: string;
}