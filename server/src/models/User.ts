import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types/index';

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
      minlength: [2, 'Nome deve ter pelo menos 2 caracteres'],
      maxlength: [100, 'Nome deve ter no máximo 100 caracteres'],
    },
    phone: {
      type: String,
      required: [true, 'Número de telefone é obrigatório'],
      unique: true,
      trim: true,
      set: (v: string) => {
        const digits = v.replace(/\D/g, '');
        if (digits.startsWith('258')) return `+${digits}`;
        if (digits.length === 9) return `+258${digits}`;
        return v;
      },
      validate: {
        validator: (v: string) => /^\+258\d{9}$/.test(v),
        message: 'Número deve ser moçambicano válido (+258XXXXXXXXX)',
      },
    },
    password: {
      type: String,
      required: [true, 'Password é obrigatória'],
      minlength: [6, 'Password deve ter pelo menos 6 caracteres'],
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'customer'],
      default: 'customer',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.index({ phone: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);