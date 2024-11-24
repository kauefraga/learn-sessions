import fastify from 'fastify';

const http = fastify();

http.get('/status', () => ({ ok: true }))

http.listen({ port: 3333 }).then(() => console.log(':> server is running at http://localhost:3333/'))
