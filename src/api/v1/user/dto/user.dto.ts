import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  phone: string;
}

export class UpdateUserDto {
  @IsOptional()
  phone?: string;

  @IsOptional()
  points?: number;

  @IsOptional()
  level?: number;

  @IsOptional()
  dgn?: number;

  @IsOptional()
  status?: string;
}
