import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Car extends Document {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true, unique: true })
    slug: string;

    @Prop({ type: MongooseSchema.Types.Mixed, required: true })
    brand: { id: string; name: string };

    @Prop({ type: MongooseSchema.Types.Mixed, required: true })
    specs: any;

    @Prop({ type: MongooseSchema.Types.Mixed, required: true })
    pricing: any;

    @Prop({ type: [String], required: true })
    categories: string[];

    @Prop({ type: MongooseSchema.Types.Mixed })
    media: any;

    @Prop({ type: MongooseSchema.Types.Mixed })
    seo: any;
}

export const CarSchema = SchemaFactory.createForClass(Car);
