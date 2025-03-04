import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PromptDocument = Prompt & Document;

@Schema({ timestamps: true })
export class Prompt {
  @Prop({ required: true })
  ipPromptsBatchSize: number;

  @Prop({ required: true })
  nonIpPromptsBatchSize: number;
}

export const PromptSchema = SchemaFactory.createForClass(Prompt);
