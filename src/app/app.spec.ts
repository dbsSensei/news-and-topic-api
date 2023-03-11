import Fastify, { FastifyInstance } from 'fastify';
import { app } from './app';
import { News, Topic } from './models';
import { Op } from 'sequelize';

describe('GET /health', () => {
  let server: FastifyInstance;

  beforeEach(() => {
    server = Fastify();
    server.register(app);
  });

  it('should respond with a message', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.json()).toEqual({ status: 'success', message: 'healthy!' });
  });
});

describe('POST /news', () => {
  let server: FastifyInstance;

  beforeEach(() => {
    server = Fastify();
    server.register(app);
  });

  it('should create a news article with given topics', async () => {
    const news = {
      title: 'Example News Title',
      content: 'Example News Content',
      topics: ['Example Topic 1', 'Example Topic 2'],
    };

    const response = await server.inject({
      method: 'POST',
      url: '/news',
      payload: news,
    });

    console.log("response.statusCode",response.statusCode)

    expect(response.statusCode).toBe(201);

    const createdNews = await News.findOne({
      where: { title: news.title },
      include: {
        association: News.associations.Topics,
        attributes: ['name'],
      },    });
    expect(createdNews).toBeDefined();
    expect(createdNews.title).toBe(news.title);
    expect(createdNews.content).toBe(news.content);
    expect(createdNews.status).toBe('published');

  });

  it('should return 500 if there is an error', async () => {
    const news = {
      title: 'Example News Title',
      content: 'Example News Content',
      topics: ['Example Topic'],
    };

    // Inject a request with invalid payload (missing required field)
    const response = await server.inject({
      method: 'POST',
      url: '/news',
      payload: { title: news.title },
    });

    expect(response.statusCode).toBe(400);
  });
});

describe('GET /news', () => {
  let server: FastifyInstance;

  beforeEach(() => {
    server = Fastify();
    server.register(app);
  });

  it('should return all news', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/news',
    });
    expect(response.json()).toEqual(expect.any(Array));
  });

  it('should return news with specified status', async () => {
    const response = await server.inject({
      method: 'GET',
      url: 'news/?status=published',
    });

    expect(response.json()).toEqual(
      expect.arrayContaining([expect.objectContaining({ status: 'published' })])
    );
  });

  it('should return news with specified topic', async () => {
    const topic = await Topic.findOne({
      where: { name: { [Op.iLike]: '%example%' } },
    });
    const news = await News.findAll({
      include: {
        association: News.associations.Topics,
        where: { id: topic.id },
      },
    });

    const response = await server.inject({
      method: 'GET',
      url: `news/?topic=${encodeURIComponent(topic.name)}`,
    });

    expect(response.statusCode).toEqual(200);
    expect(response.json()).toEqual(
      expect.arrayContaining(
        news.map((n) => expect.objectContaining({ id: n.id }))
      )
    );
  });
});
