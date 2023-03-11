import { Model, DataTypes, Sequelize } from 'sequelize';

class Topic extends Model {
    public id!: number;
    public name!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

const TopicFactory = (sequelize: Sequelize) => {
    Topic.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            sequelize,
            tableName: 'topics',
        }
    );

    return Topic;
};

export { TopicFactory };
