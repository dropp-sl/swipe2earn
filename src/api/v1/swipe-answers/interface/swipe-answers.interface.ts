import { Document } from 'mongoose';

export interface IMetadata {
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  label: string;
  categories: string[]; // Reference to Category ID
}

export interface ISwipeAnswer extends Document {
  userId: string; // Reference to User ID
  annotationsId: string; // Reference to Annotation ID
  answer: boolean; // User's answer (Yes/No)
  metadata: IMetadata[]; // Array of metadata objects (labels, bounding boxes, categories)
  points: number; // Points earned from this answer
  createdAt: Date;
  updatedAt: Date;
}
