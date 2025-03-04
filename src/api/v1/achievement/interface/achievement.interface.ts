import { Types } from 'mongoose';

export interface IAchievement extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  icon: string;
  createdAt?: Date;
  updatedAt?: Date;
}
