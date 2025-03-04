import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AchievementDocument = Achievement & Document;

@Schema()
export class Achievement {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  icon: string; // URL or path to badge image
}

export const AchievementSchema = SchemaFactory.createForClass(Achievement);
