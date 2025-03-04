import { IsBoolean, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateAnnotationsDto {
  @IsNotEmpty()
  @IsString()
  prompt: string;

  @IsNotEmpty()
  @IsString()
  imageUrl: string;

  @IsNotEmpty()
  @IsBoolean()
  ipExists: boolean;

  @IsOptional()
  metadata?: any;

  @IsOptional()
  @IsBoolean()
  available?: boolean;
}
