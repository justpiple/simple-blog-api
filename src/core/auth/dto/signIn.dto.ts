import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ description: "User's email" })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "User's password " })
  password: string;
}

export default SignInDto;
