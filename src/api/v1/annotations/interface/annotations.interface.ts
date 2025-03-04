import { Document } from 'mongoose';

export interface IAnnotation extends Document {
  prompt: string; // Generated prompt for image creation
  imageUrl: string; // URL of the stored image in OCI
  ipExists: boolean; // Whether the image contains Intellectual Property
  metadata?: {
    [key: string]: any;
  }; // Optional metadata if needed
  createdAt: Date;
  updatedAt: Date;
}
