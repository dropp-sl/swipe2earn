import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreatePromptDto {
  @IsNotEmpty()
  @IsNumber()
  ipPromptsBatchSize: number;

  @IsNotEmpty()
  @IsNumber()
  nonIpPromptsBatchSize: number;
}
