import Fastify from 'fastify';
import { app } from './app/app';
import fastifyEnv from '@fastify/env';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const schema = {
  type: 'object',
  required: ['DB_NAME'],
  properties: {
    DB_NAME: {
      type: 'string',
      default: 'postgres',
    },
    DB_USERNAME: {
      type: 'string',
      default: 'postgres',
    },
    DB_PASSWORD: {
      type: 'string',
      default: 'password',
    },
    DB_HOST: {
      type: 'string',
      default: 'localhost',
    },
  },
};

const options = {
  confKey: 'config', // optional, default: 'config'
  schema: schema,
};

// Instantiate Fastify with some config
const server = Fastify({
  logger: true,
});

// Register your application as a normal plugin.
server.register(fastifyEnv, options);
console.log("test",process.env.DB_NAME,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: 'postgres',
    })
server.register(app);

// Start listening.
server.listen({ port, host }, (err) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  } else {
    console.log(`[ ready ] http://${host}:${port}`);
  }
});
