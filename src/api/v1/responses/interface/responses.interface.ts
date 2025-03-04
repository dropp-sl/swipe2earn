export interface IResponse {
  _id: string;
  userId: string;
  annotationId: string;
  answer: boolean;
  isCorrect: boolean;
  selectedCategories?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
