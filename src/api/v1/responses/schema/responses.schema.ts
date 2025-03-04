import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ResponseDocument = Response & Document;

@Schema({ timestamps: true })
export class Response {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Generation', required: true })
  annotationId: Types.ObjectId;

  @Prop({ required: true })
  answer: boolean; // true = Yes, false = No

  @Prop({ required: true })
  isCorrect: boolean; // Did they answer correctly?

  @Prop({ default: 0 })
  pointsEarned: number;

  @Prop({ type: [Types.ObjectId], ref: 'Category', default: [] })
  selectedCategories: Types.ObjectId[];
}

export const ResponseSchema = SchemaFactory.createForClass(Response);
