import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserStatus } from 'src/utils/enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ default: 0 })
  points: number;

  @Prop({ default: 1 })
  level: number;

  @Prop({ default: 0 })
  dgn: number;

  @Prop({ default: UserStatus.INACTIVE, required: false })
  status?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
