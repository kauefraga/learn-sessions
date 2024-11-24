import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';

const http = fastify();

http.register(cors);
http.register(helmet)

http.get('/status', () => ({ ok: true }))

http.listen({ port: 3333 }).then(() => console.log(':> server is running at http://localhost:3333/'))
