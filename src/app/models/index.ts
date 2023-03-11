import { Sequelize } from 'sequelize';
import { NewsFactory } from './news';
import { TopicFactory } from './topic';
import { NewsTopicFactory } from './news-topic';

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
  }
);

const News = NewsFactory(sequelize);
const Topic = TopicFactory(sequelize);
const NewsTopic = NewsTopicFactory(sequelize);

News.belongsToMany(Topic, { through: NewsTopic });
Topic.belongsToMany(News, { through: NewsTopic });

sequelize
  .sync()
  .then(() => console.log('Models synchronized with database'))
  .catch((err) =>
    console.error('Error synchronizing models with database: ', err)
  );

export { sequelize, News, Topic, NewsTopic };
