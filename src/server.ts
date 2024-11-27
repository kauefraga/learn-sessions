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

const AuthUserSchema = z.object({
  name: z.string().max(100).optional(),
  email: z.string().max(255).email().optional(),
  password: z.string(),
});

http.post('/v1/user/auth', async (request, reply) => {
  const userSession = await AuthUser(request, db);

  if (userSession) {
    return reply.status(400).send({
      message: 'Session already exists.',
    });
  }

  const { name, email, password } = AuthUserSchema.parse(request.body);

  if (!(name || email)) {
    return reply.status(400).send({
      message: 'At least one field (either name or email) must be exist.',
    });
  }

  const emailOrName = email ? eq(user.email, email) : eq(user.name, name ?? '');

  const [existingUser] = await db.select().from(user).where(emailOrName).limit(1);

  if (!existingUser) {
    return reply.status(400).send({
      message: 'User does not exist.',
    });
  }

  const passwordMatch = await argon2.verify(existingUser.password, password);

  if (!passwordMatch) {
    return reply.status(400).send({
      message: 'User name, email or password are invalid.',
    });
  }

  const [newSession] = await db
    .insert(session)
    .values({ userId: existingUser.id })
    .returning();

  return reply
    .cookie('sessionId', newSession.id, {
      signed: true
    })
    .status(201)
    .send(newSession);
});

http.delete('/v1/user/logout', async (request, reply) => {
  const userSession = await AuthUser(request, db);

  if (!userSession) {
    return reply.status(401).send({
      message: 'No session to log out.',
    });
  }

  const { rowCount } = await db.delete(session).where(eq(session.id, userSession.id));

  if (rowCount === 0) {
    return reply.status(500).send({
      message: 'Failed to delete session.'
    });
  }

  return reply
    .clearCookie('sessionId')
    .status(204)
    .send();
});

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
