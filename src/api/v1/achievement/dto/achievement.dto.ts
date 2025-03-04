import { IsOptional, IsString } from 'class-validator';

export class CreateAchievementDto {
  @IsString() readonly name: string;
  @IsString() readonly description: string;
  @IsString() readonly icon: string;
}
export class UpdateAchievementDto {
  @IsOptional() @IsString() readonly name?: string;
  @IsOptional() @IsString() readonly description?: string;
  @IsOptional() @IsString() readonly icon?: string;
}
