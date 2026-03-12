import mongoose from 'mongoose';
import { User } from './models/User'; 

async function createAdmin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/streamsaas'); 

    // 1. Limpa o admin anterior para evitar erro de "unique phone" e garantir dados novos
    await User.deleteOne({ phone: '+258833860166' });

    // 2. Cria o novo admin
    // NÃO use bcrypt.hash aqui. O seu UserSchema.pre('save') já faz isso!
    const admin = new User({
      name: 'Admin',
      phone: '+258833860166',
      password: 'admin123', // Senha em texto limpo, o Model vai encriptar
      role: 'admin',
      isActive: true,
    });

    await admin.save();
    
    console.log('---');
    console.log('✅ Admin configurado com sucesso!');
    console.log('Telefone: +258833860166');
    console.log('Senha: admin123');
    console.log('---');

  } catch (error) {
    console.error('❌ Erro ao criar admin:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();