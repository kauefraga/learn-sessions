import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { z } from 'zod';
import { db } from './database/index.js';
import { session, user } from './database/schema.js';
import { eq } from 'drizzle-orm';
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

  // TODO PASSWORD HASHING

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

// TODO PAGINATION
// TODO VIEW/HTML
http.get('/v1/users', async (request, reply) => {
  const sessionId = request.cookies.sessionId;

  if (!sessionId) {
    return reply.status(401).send({
      message: 'Authentication is required.'
    });
  }

  const [userSession] = await db
    .select()
    .from(session)
    .where(eq(session.id, sessionId))
    .limit(1);

  if (!userSession) {
    return reply.status(401).send({
      message: 'Invalid session.'
    });
  }

  const users = await db.select().from(user);

  return reply.send(users);
});

http.listen({ port: 3333 })
  .then(() => console.log(':> server is running at http://localhost:3333/'));
