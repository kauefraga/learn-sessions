import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import { env } from './env.js';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

export function createServer() {
  const http = fastify();

  http.register(cors);
  http.register(helmet);
  http.register(cookie, {
    secret: env.COOKIE_SECRET
  });

  return http;
}

type ServerContext = ReturnType<typeof createServer>;

export type Controller = (http: ServerContext, db: NodePgDatabase) => void;

export function defineController(callback: Controller): Controller {
  return callback;
}

export function defineRoutes(http: ServerContext, db: NodePgDatabase, controllers: Controller[]) {
  for (const controller of controllers) {
    controller(http, db);
  }
}
