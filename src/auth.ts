import type { FastifyRequest } from 'fastify';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { session } from './database/schema.js';

/**
 * Check sessionId cookie and fetch user session
 * @returns session
 */
export async function AuthUser(request: FastifyRequest, db: NodePgDatabase) {
  const sessionId = request.cookies.sessionId;

  if (!sessionId) {
    return;
  }

  const [userSession] = await db
    .select()
    .from(session)
    .where(eq(session.id, sessionId))
    .limit(1);

  if (!userSession) {
    return;
  }

  const timeSinceSessionStart = new Date().getTime() - userSession.startedAt.getTime();

  // magic numbers: one day (24h) in milliseconds
  if (timeSinceSessionStart > 1000 * 60 * 60 * 24) {
    return; // session expired
  }

  return userSession;
}
