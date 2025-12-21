import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum UserRole {
    CLIENT = 'client',
    ADMIN = 'admin',
    PARTNER = 'partner',
}

@Schema({ timestamps: true })
export class User extends Document {
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

    // Кто пригласил этого пользователя
    @Prop({ type: Types.ObjectId, ref: 'User', index: true })
    referredBy?: Types.ObjectId;

    // Только для партнёра
    @Prop({
        unique: true,
        sparse: true,
        uppercase: true,
        trim: true,
    })
    referralCode?: string;

    // Список рефералов партнёра
    @Prop({
        type: [{ type: Types.ObjectId, ref: 'User' }],
        default: [],
    })
    referrals?: Types.ObjectId[];

    // Процент партнёра
    @Prop({ default: 10 })
    referralPercent?: number;

    // Начисленный доход партнёра
    @Prop({ default: 0 })
    referralBalance?: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
