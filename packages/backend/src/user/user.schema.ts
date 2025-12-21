import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, HydratedDocument } from 'mongoose';

export enum UserRole {
    CLIENT = 'client',
    ADMIN = 'admin',
    PARTNER = 'partner',
}

@Schema({ timestamps: true })
export class User {
    /* =================== ОСНОВНОЕ =================== */

    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    email: string;

    @Prop({ required: true, select: false })
    password: string;

    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    username: string;

    @Prop({
        type: String,
        enum: UserRole,
        default: UserRole.CLIENT,
        index: true,
    })
    role: UserRole;

    @Prop()
    phone?: string;

    @Prop({ default: true })
    isActive: boolean;

    /* =================== РЕФЕРАЛКА =================== */

    @Prop({ type: Types.ObjectId, ref: 'User', index: true })
    referredBy?: Types.ObjectId;

    @Prop({ unique: true, sparse: true, uppercase: true, trim: true })
    referralCode?: string;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
    referrals?: Types.ObjectId[];

    @Prop({ default: 10 })
    referralPercent?: number;

    @Prop({ default: 0 })
    referralBalance?: number;
}

// Создаём схему
export const UserSchema = SchemaFactory.createForClass(User);

// Тип для TypeScript: экземпляр документа Mongoose
export type UserDocument = HydratedDocument<User>;
