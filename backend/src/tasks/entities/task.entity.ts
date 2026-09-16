import {Table, Column,Model, DataType} from 'sequelize-typescript';

@Table
(
    {
        tableName: 'tasks',
        timestamps: true,
        underscored: true,
    }
)

export class Task extends Model
{
    @Column
    (
        {
            type: DataType.STRING,
            allowNull: false,
        }
    )
    title: string;

    @Column
    (
        {
            type: DataType.STRING,
            allowNull: true,
        }
    )
    description: string;

    @Column
    (
        {
            type: DataType.ENUM('todo', 'in_progress', 'done'),
            allowNull: false,
            defaultValue: 'todo',
        }
    )
    status: string;

    @Column
    (
        {
            type: DataType.DATE,
            allowNull: true,
        }  
    )
    dueDate: Date;

    @Column
    (
        {
            type: DataType.INTEGER,
            allowNull: false
        }
    )
    projectId: number;

    @Column
    (
        {
            type: DataType.INTEGER,
            allowNull: true
        }
    )
    assigneeId: number;

    @Column
(
    {
        type: DataType.ENUM('low', 'medium', 'high'),
        allowNull: false,
        defaultValue: 'medium',
    }
)
priority: string;
}