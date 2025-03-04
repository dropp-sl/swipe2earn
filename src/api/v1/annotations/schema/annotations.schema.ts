import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from '../../user/schema/user.schema';

export type AnnotationsDocument = Annotations & Document;

@Schema({ timestamps: true })
export class Annotations {
  @Prop({ required: true })
  prompt: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: true })
  ipExists: boolean;

  @Prop({ type: mongoose.Schema.Types.Mixed, default: null })
  metadata: any;

  @Prop({ type: Boolean, default: true })
  available: boolean;

  @Prop({
    type: [mongoose.Types.ObjectId],
    ref: 'User',
    default: [],
    validate: {
      validator: function (v: string[]) {
        return Array.isArray(v) && new Set(v).size === v.length;
      },
      message: 'All elements in the array must be unique.',
    },
  })
  userIds: Array<string | User>;
}

export const AnnotationsSchema = SchemaFactory.createForClass(Annotations);

AnnotationsSchema.index({ prompt: 'text' });
