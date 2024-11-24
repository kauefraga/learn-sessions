import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { z } from 'zod';
import { db } from './database/index.js';
import { session, user } from './database/schema.js';
import { eq } from 'drizzle-orm';
import cookie from '@fastify/cookie';
import argon2 from 'argon2';
import { AuthUser } from './auth.js';

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

  const password = await argon2.hash(userData.password);

  const [newUser] = await db
    .insert(user)
    .values({
      ...userData,
      password,
    })
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
    .send({
      ...newUser,
      password: undefined
    });
});

// http.post('/v1/user/auth', (request, reply) => {});
// http.post('/v1/user/logout', (request, reply) => {});

// TODO PAGINATION
http.get('/v1/users', async (request, reply) => {
  const userSession = await AuthUser(request, db);

  if (!userSession) {
    return reply.status(401).send({
      message: 'Invalid session.',
    });
  }

  const users = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      displayName: user.displayName,
      createdAt: user.createdAt,
      sessionId: session.id,
    })
    .from(user)
    .leftJoin(session, eq(session.userId, user.id));

  return reply.send(users);
});

http.listen({ port: 3333 })
  .then(() => console.log(':> server is running at http://localhost:3333/'));
