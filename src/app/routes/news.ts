import { FastifyInstance } from 'fastify';
import { News, NewsTopic, sequelize, Topic } from '../models';
import { Op } from 'sequelize';

type NewsQueryParams = {
  status?: string;
  topic?: string;
};

async function getAllNews(req, reply) {
  const { status, topic }: NewsQueryParams = req.query;
  const filter: { status?: string; '$Topics.name$'?: { [Op.iLike]: string } } =
    {};

  if (status) {
    filter.status = status;
  }

  if (topic) {
    filter['$Topics.name$'] = { [Op.iLike]: `%${topic}%` };
  }

  try {
    const news = await News.findAll({
      where: filter,
      include: {
        association: News.associations.Topics,
        attributes: ['name'],
      },
      order: [['updatedAt', 'desc']],
    });

    const response = JSON.parse(JSON.stringify(news));
    for (const r of response) {
      r.topics = r.Topics.map((t) => t.name);
      delete r.Topics;
    }
    reply.send(response);
  } catch (err) {
    reply.status(500).send({ error: err.message });
  }
}

async function createNews(req, reply) {
  const { title, content, topics } = req.body;

  const t = await sequelize.transaction();

  try {
    let news = await News.create(
      { title, content, status: 'published' },
      { transaction: t }
    );
    news = JSON.parse(JSON.stringify(news));

    const createdTopics = await Promise.all(
      topics.map((topicName) =>
        Topic.findOrCreate({ where: { name: topicName }, transaction: t })
      )
    );

    const topicIds = JSON.parse(JSON.stringify(createdTopics)).map(
      (topic) => topic[0].id
    );

    await Promise.all(
      topicIds.map(async (topicId) => {
        await NewsTopic.create(
          { news_id: news.id, topic_id: topicId },
          { transaction: t }
        );
      })
    );

    await t.commit();

    reply.status(201);
  } catch (err) {
    await t.rollback();
    reply.status(500).send({ error: err.message });
  }
}

async function updateNews(req, reply) {
  const { id } = req.params;
  const { topics } = req.body;
  let { title, content, status } = req.body;

  const t = await sequelize.transaction();

  try {
    const news = await News.findByPk(id, { transaction: t });
    const parsedNews = JSON.parse(JSON.stringify(news));
    if (!news) {
      reply.status(404).send({ error: 'News not found' });
      return;
    }

    title = title || parsedNews.title;
    content = content || parsedNews.content;
    status = status || parsedNews.status;

    await news.update({ title, content, status }, { transaction: t });

    const createdTopics = await Promise.all(
      topics.map((topicName) =>
        Topic.findOrCreate({ where: { name: topicName }, transaction: t })
      )
    );

    const topicIds = JSON.parse(JSON.stringify(createdTopics)).map(
      (topic) => topic[0].id
    );

    await NewsTopic.destroy({
      where: { news_id: parsedNews.id },
      transaction: t,
    });

    await Promise.all(
      topicIds.map(async (topicId) => {
        await NewsTopic.create(
          { news_id: parsedNews.id, topic_id: topicId },
          { transaction: t }
        );
      })
    );

    await t.commit();

    reply.status(200);
  } catch (err) {
    await t.rollback();
    reply.status(500).send({ error: err.message });
  }
}

async function deleteNews(req, reply) {
  const { id: newsId } = req.params;

  const t = await sequelize.transaction();

  try {
    // Delete News and associated NewsTopics records in a transaction
    await Promise.all([
      News.destroy({ where: { id: newsId }, transaction: t }),
      NewsTopic.destroy({ where: { news_id: newsId }, transaction: t }),
    ]);

    await t.commit();

    reply.status(204).send();
  } catch (err) {
    await t.rollback();
    reply.status(500).send({ error: err.message });
  }
}

export const newsHandlers = async function (app: FastifyInstance) {
  app.get('/', getAllNews);

  app.post(
    '/',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            content: { type: 'string' },
            topics: {
              type: 'array',
              items: { type: 'string' },
            },
          },
          required: ['title', 'content', 'topics'],
        },
      },
    },
    createNews
  );

  app.put(
    '/:id',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            content: { type: 'string' },
            status: { type: 'string', enum: ['draft', 'deleted', 'published'] },
            topics: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
      },
    },
    updateNews
  );
  app.delete('/:id', deleteNews);
};
