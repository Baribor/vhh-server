import { PickType } from '@nestjs/mapped-types';
import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class SignUpDTO {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  region: string;

  @IsNotEmpty()
  @IsPhoneNumber()
  phoneNumber: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class LoginDTO extends PickType(SignUpDTO, [
  'email',
  'password',
] as const) {}

export class ForgotPasswordDTO extends PickType(SignUpDTO, ['email']) {}

export class ResetPasswordDTO {
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
