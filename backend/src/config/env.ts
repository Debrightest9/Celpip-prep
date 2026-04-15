import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT || '3000',
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'celpip-secret-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o',
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3001',
};

export function validateEnv() {
  const required = ['DATABASE_URL', 'OPENAI_API_KEY', 'JWT_SECRET'];
  for (const key of required) {
    if (!process.env[key]) {
      console.warn(`⚠️  Missing env var: ${key}`);
    }
  }
}
