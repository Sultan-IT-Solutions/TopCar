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
    carModel: { id: string; name: string };

    @Prop({ type: MongooseSchema.Types.Mixed, required: true })
    status: { isNew: boolean; available: boolean };

    @Prop({ type: MongooseSchema.Types.Mixed, required: true })
    class: { id: string; name: string };

    @Prop({ type: [String], required: true })
    categories: string[];

    @Prop({ type: MongooseSchema.Types.Mixed, required: true })
    specs: any;

    @Prop({ type: MongooseSchema.Types.Mixed, required: true })
    pricing: any;

    @Prop({ type: [MongooseSchema.Types.Mixed] })
    options: any[];

    @Prop({ type: MongooseSchema.Types.Mixed })
    insurance: any;

    @Prop({ type: MongooseSchema.Types.Mixed })
    location: any;

    @Prop({ type: MongooseSchema.Types.Mixed })
    media: any;

    @Prop({ type: MongooseSchema.Types.Mixed })
    seo: any;
}

export const CarSchema = SchemaFactory.createForClass(Car);
