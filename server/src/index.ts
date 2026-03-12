import 'dotenv/config';
import app from './app';
import connectDB from './config/database';
import { User } from './models/User';

const PORT = process.env.PORT || 5000;


const start = async (): Promise<void> => {
  await connectDB();

  app.listen(PORT, () => {
    console.log('\n========================================');
    console.log(`🚀 StreamSaas API rodando na porta ${PORT}`);
    console.log(`📍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 URL: http://localhost:${PORT}/api/health`);
    console.log('========================================\n');
  });
};

process.on('unhandledRejection', (err: Error) => {
  console.error('❌ Unhandled Rejection:', err.message);
  process.exit(1);
});

process.on('uncaughtException', (err: Error) => {
  console.error('❌ Uncaught Exception:', err.message);
  process.exit(1);
});

start();