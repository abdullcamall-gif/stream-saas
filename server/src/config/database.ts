import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGO_URI não definida no ficheiro .env');

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB conectado: ${conn.connection.host}`);

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB desconectado. Tentando reconectar...');
    });
    mongoose.connection.on('error', (err) => {
      console.error('Erro MongoDB:', err);
    });
  } catch (error) {
    console.error('Falha ao conectar ao MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;