import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'tags',
  timestamps: true,
  underscored: true,
})
export class Tag extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  color: string;
}