import { IsBoolean, IsMongoId, IsArray, IsOptional } from 'class-validator';

export class CreateResponseDto {
  @IsMongoId()
  userId: string;

  @IsMongoId()
  annotationId: string;

  @IsBoolean()
  answer: boolean;

  @IsBoolean()
  isCorrect: boolean;

  @IsOptional()
  @IsArray()
  selectedCategories?: string[];
}
