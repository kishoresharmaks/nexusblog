import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, Matches } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Alex Developer' })
  @IsString({ message: 'Full name must be a string' })
  @IsNotEmpty({ message: 'Full name is required' })
  name!: string;

  @ApiProperty({ example: 'alexdev' })
  @IsString({ message: 'Username must be a string' })
  @IsNotEmpty({ message: 'Username is required' })
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Username can only contain letters, numbers, underscores, and hyphens',
  })
  username!: string;

  @ApiProperty({ example: 'alex@example.com' })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @IsNotEmpty({ message: 'Email address is required' })
  email!: string;

  @ApiProperty({ example: 'SuperSecurePassword123!' })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string;

  @ApiPropertyOptional({ example: 'https://avatar.url/me.png' })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({ example: 'Backend systems engineer & distributed systems enthusiast.' })
  @IsString()
  @IsOptional()
  bio?: string;
}
