import { Model, DataTypes, Sequelize } from 'sequelize';

class NewsTopic extends Model {
  public id!: number;
  public news_id!: number;
  public topic_id!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

const NewsTopicFactory = (sequelize: Sequelize) => {
  NewsTopic.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      news_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'news',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      topic_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'topics',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
    },
    {
      sequelize,
      tableName: 'news_topics',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['news_id', 'topic_id'],
        },
      ],
    }
  );

  return NewsTopic;
};

export { NewsTopicFactory };
