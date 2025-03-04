import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Coordinates } from 'src/utils/types';

export class Metadata {
  @Prop({ required: true, type: Object })
  coordinates: Coordinates;

  @Prop({ required: true })
  label: string;

  @Prop({ required: true, type: mongoose.Types.ObjectId, ref: 'Category' })
  category: string;
}

@Schema({
  _id: true,
  timestamps: true,
  versionKey: false,
  collection: 'swipe-answers',
})
export class SwipeAnswer {
  @Prop({ required: true, type: mongoose.Types.ObjectId, ref: 'User' })
  userId: mongoose.Types.ObjectId;

  @Prop({ required: true, type: mongoose.Types.ObjectId, ref: 'Annotations' })
  annotationsId: string;

  @Prop({ required: true, type: Boolean, default: false })
  answer: boolean;

  @Prop({
    required: true,
    default: [],
    type: [Metadata],
  })
  metadata: Array<Metadata>;

  @Prop({ required: true, type: Number, default: 0 })
  points: number;
}

export const SwipeAnswerSchema = SchemaFactory.createForClass(SwipeAnswer);
