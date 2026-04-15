import { validateEnv } from './config/env';
import { env } from './config/env';
import app from './app';
import { prisma } from './lib/prisma';

validateEnv();

const PORT = parseInt(env.PORT);

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    app.listen(PORT, () => {
      console.log(`🚀 CELPIP API running on http://localhost:${PORT}`);
      console.log(`📚 Environment: ${env.NODE_ENV}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

main();
