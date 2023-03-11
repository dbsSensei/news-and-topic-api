import { FastifyInstance,FastifyReply } from 'fastify';
import { newsHandlers } from './news';

export default async function(app: FastifyInstance) {
    app.get("/health", (_, reply: FastifyReply) => {
        reply.send({status: "success", message: "healthy!"})
    })
    app.register(newsHandlers, { prefix: '/news' });
}
