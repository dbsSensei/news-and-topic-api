import { News, Topic, NewsTopic } from './index';

describe('News model', () => {
  beforeAll(async () => {
    await News.destroy({ where: {}, truncate: true, cascade: true });
  });

  it('should create a news', async () => {
    const news = await News.create({
      title: 'Test news',
      content: 'Test content',
      status: 'published',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(news.title).toBe('Test news');
    expect(news.content).toBe('Test content');
    expect(news.status).toBe('published');
  });

  it('should find all news', async () => {
    const news = await News.findAll();
    expect(news.length).toBe(1);
    expect(news[0].title).toBe('Test news');
    expect(news[0].content).toBe('Test content');
    expect(news[0].status).toBe('published');
  });

  it('should delete a news', async () => {
    const news = await News.findOne({ where: { title: 'Test news' } });
    await news.destroy();
    const deletedNews = await News.findOne({
      where: { title: 'Test news' },
    });
    expect(deletedNews).toBeNull();
  });
});

describe('Topic model', () => {
  beforeAll(async () => {
    await Topic.destroy({ where: {}, truncate: true, cascade: true });
  });

  it('should create a topic', async () => {
    const topic = await Topic.create({
      name: 'Test topic',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(topic.name).toBe('Test topic');
  });

  it('should find all topics', async () => {
    const topics = await Topic.findAll();
    expect(topics.length).toBe(1);
    expect(topics[0].name).toBe('Test topic');
  });

  it('should delete a topic', async () => {
    const topic = await Topic.findOne({ where: { name: 'Test topic' } });
    await topic.destroy();
    const deletedTopic = await Topic.findOne({
      where: { name: 'Test topic' },
    });
    expect(deletedTopic).toBeNull();
  });
});

describe('NewsTopic model', () => {
  beforeAll(async () => {
    await News.destroy({ where: {}, truncate: true, cascade: true });
  });

  it('should create a news topic association', async () => {
    const news = await News.create({
      title: 'Test news',
      content: 'Test content',
      status: 'published',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const topic = await Topic.create({
      name: 'Test topic',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const newsTopic = await NewsTopic.create({
      news_id: news.id,
      topic_id: topic.id,
      created_at: new Date(),
      updated_at: new Date(),
    });
    expect(newsTopic.news_id).toBe(news.id);
    expect(newsTopic.topic_id).toBe(topic.id);
  });

  it('should find all news topic associations', async () => {
    const newsTopic = await NewsTopic.findAll();
    expect(newsTopic.length).toBe(1);
    expect(newsTopic[0].news_id).toBeDefined();
    expect(newsTopic[0].topic_id).toBeDefined();
  });

  it('should delete a news topic association', async () => {
    const news = await News.create({
      title: 'Test news',
      content: 'Test content',
      status: 'published',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const topic = await Topic.create({
      name: 'Test topic',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const newsTopic = await NewsTopic.create({
      news_id: news.id,
      topic_id: topic.id,
      created_at: new Date(),
      updated_at: new Date(),
    });
    await newsTopic.destroy();
    const deletedNewsTopic = await NewsTopic.findOne({
      where: { id: newsTopic.id },
    });
    expect(deletedNewsTopic).toBeNull();
  });
});
