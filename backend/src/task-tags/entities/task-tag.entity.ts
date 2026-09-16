import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table
(
    {
        tableName: 'task_tags',
        timestamps: true,
        underscored: true,
    }
)
export class TaskTag extends Model
{
    @Column
    (
        {
            type: DataType.INTEGER,
            allowNull: false,
        }
    )
    taskId: number;

    @Column
    (
        {
            type: DataType.INTEGER,
            allowNull: false,
        }
    )
    tagId: number;
}