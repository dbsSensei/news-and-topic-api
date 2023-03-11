import { Model, DataTypes, Sequelize } from 'sequelize';

class News extends Model {
    public id!: number;
    public title!: string;
    public content!: string;
    public status!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

const NewsFactory = (sequelize: Sequelize) => {
    News.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            content: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM('draft', 'deleted', 'published'),
                allowNull: false,
            },
        },
        {
            sequelize,
            tableName: 'news',
        }
    );

    return News;
};

export { NewsFactory };