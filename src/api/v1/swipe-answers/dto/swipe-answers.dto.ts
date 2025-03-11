import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsString,
  ValidateNested,
  IsDefined,
  ValidateIf,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Coordinates } from 'src/utils/types';

export class metadata {
  @IsNotEmpty()
  coordinates: Coordinates;

  @IsNotEmpty()
  @IsString()
  label: string;

  @IsNotEmpty()
  @IsArray()
  categories: string[];
}

export class SubmitSwipeAnswerDto {
  @IsNotEmpty()
  @IsMongoId()
  annotationsId: string;

  @IsNotEmpty()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  answer: boolean;

  @ValidateIf((o) => o.answer === true)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => metadata)
  metadata: Array<metadata>;
}

export class GetSwipeAnswerDto {
  @IsNotEmpty()
  annotationsId: string;
}
