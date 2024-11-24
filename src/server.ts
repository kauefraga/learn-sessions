import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';

const http = fastify();

http.register(cors);
http.register(helmet);

http.get('/status', () => ({ ok: true }));

// FIRST http.post('/v1/user/create', (request, reply) => {});
// http.post('/v1/user/auth', (request, reply) => {});

// If user is authenticated, then they can see other users :)
// FIRST http.get('/v1/users', (request, reply) => {});

http.listen({ port: 3333 })
  .then(() => console.log(':> server is running at http://localhost:3333/'));
