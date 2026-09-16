import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table
(
    {
        tableName: 'comments',
        timestamps: true,
        underscored: true,
    }
)
export class Comment extends Model
{
    @Column
    (
        {
            type: DataType.TEXT,
            allowNull: false,
        }
    )
    comment: string;

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
    userId: number;
}