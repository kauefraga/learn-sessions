import { z } from 'zod';

const EnvSchema = z.object({
  DATABASE_URL: z.string().startsWith('postgres'),
  COOKIE_SECRET: z.string().min(32),
  MAIL_USER: z.string(),
  MAIL_PASSWORD: z.string()
});

export const env = EnvSchema.parse(process.env);
