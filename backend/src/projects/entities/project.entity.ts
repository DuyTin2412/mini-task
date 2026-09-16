import {Table , Column, Model,DataType, HasMany, AllowNull} from 'sequelize-typescript';
@Table({
    tableName: 'projects',
    timestamps: true,
    underscored: true,
})
export class Project extends Model {
    @Column
    ({
        type: DataType.STRING,
        allowNull: false
    })
    projectName: string;

    @Column
    ({
        type: DataType.STRING,
        allowNull: true
    })
    description: string;

    @Column
    ({
        type: DataType.INTEGER,
        allowNull: false
    })
    ownerId: number;
}