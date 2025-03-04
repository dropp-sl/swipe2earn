import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'categories' })
export class Category extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  })
  parentId?: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
