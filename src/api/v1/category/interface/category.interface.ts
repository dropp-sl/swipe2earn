import { Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  parentId?: string; // If it exists, this is a subcategory
  createdAt: Date;
  updatedAt: Date;
}
