import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ForgotPasswordDTO,
  LoginDTO,
  ResetPasswordDTO,
  SignUpDTO,
} from './dto/auth.dto';
import { AuthUser, BaseResponseDTO } from 'src/utils/utils.types';
import { CurrentUser } from 'src/schematics/decorators/custom.decorator';
import { AuthGuard } from 'src/schematics/gaurds/auth.gaurd';
import { Response } from 'express';

@Controller('/api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  async signup(@Body() payload: SignUpDTO): Promise<BaseResponseDTO> {
    return await this.authService.signup(payload);
  }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() payload: LoginDTO,
    @Res({ passthrough: true }) response: Response,
  ): Promise<BaseResponseDTO> {
    const res = await this.authService.login(payload);
    response.cookie('token', res.data.token, {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });
    return res;
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgorPassword(
    @Body() payload: ForgotPasswordDTO,
  ): Promise<BaseResponseDTO> {
    return await this.authService.forgotPassword(payload.email);
  }

  @Patch('reset-password')
  @UseGuards(AuthGuard)
  async resetPassword(
    @CurrentUser() user: AuthUser,
    @Body() payload: ResetPasswordDTO,
  ): Promise<BaseResponseDTO> {
    return this.authService.resetPassword(user.id, payload.newPassword);
  }

  @Get('logout')
  async logout(
    @Res({ passthrough: true }) response: Response,
  ): Promise<BaseResponseDTO> {
    response.cookie('token', null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    return {
      status: true,
      message: 'logged out successfully',
    };
  }
}
