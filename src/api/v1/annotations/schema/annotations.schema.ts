import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AnnotationsDocument = Annotations & Document;

@Schema({ timestamps: true })
export class Annotations {
  @Prop({ required: true })
  prompt: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: true })
  ipExists: boolean;

  @Prop({ default: null })
  metadata: any;
}

export const AnnotationsSchema = SchemaFactory.createForClass(Annotations);
