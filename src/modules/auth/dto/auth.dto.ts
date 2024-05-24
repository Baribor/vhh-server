import { PickType } from '@nestjs/mapped-types';
import { GENDER } from '@prisma/client';

import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class SignUpDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsPhoneNumber()
  phoneNumber: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsIn(Object.values(GENDER))
  gender: GENDER;

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
