import { Types } from 'mongoose';
import { Platforms } from 'src/utils/enum';

export interface IUser extends Document {
  _id: string | Types.ObjectId;
  username: string;
  email: string;
  password: string;
  phone: string;
  status: string;
  isVerified: boolean;
  picture?: string;
  platform: Platforms[];
  platformIds: Record<string, string>;
  createdAt?: Date;
  updatedAt?: Date;
  lastLogin?: Date;
  deleted?: UserDeleted;
}

export type UserDeleted = {
  isDeleted: boolean;
  dateOfDeletion: Date;
};
