import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { z } from 'zod';
import { db } from './database/index.js';
import { session, user } from './database/schema.js';
import cookie from '@fastify/cookie';

const http = fastify();

http.register(cors);
http.register(helmet);
http.register(cookie, {
  secret: process.env.COOKIE_SECRET!
});

http.get('/status', () => ({ ok: true }));

const CreateUserSchema = z.object({
  displayName: z.string().max(255).optional(),
  name: z.string().max(100),
  email: z.string().max(255).email(),
  password: z.string(),
});

http.post('/v1/user/create', async (request, reply) => {
  const userData = CreateUserSchema.parse(request.body);

  // user already exists?

  const [newUser] = await db
    .insert(user)
    .values(userData)
    .returning();

  const [userSession] = await db
    .insert(session)
    .values({
      userId: newUser.id
    })
    .returning({
      id: session.id
    });

  return reply
    .cookie('sessionId', userSession.id, {
      signed: true
    })
    .status(201)
    .send(newUser);
});
// http.post('/v1/user/auth', (request, reply) => {});

// If user is authenticated, then they can see other users :)
// FIRST http.get('/v1/users', (request, reply) => {});

http.listen({ port: 3333 })
  .then(() => console.log(':> server is running at http://localhost:3333/'));
