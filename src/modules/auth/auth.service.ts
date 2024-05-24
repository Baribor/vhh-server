import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { LoginDTO, SignUpDTO } from './dto/auth.dto';
import { AuthUser, BaseResponseDTO } from 'src/utils/utils.types';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { genSalt, hash, compareSync } from 'bcryptjs';
import { omit } from 'src/utils/utils.functions';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  generateAuthToken(payload: AuthUser): string {
    const token = this.jwtService.sign(payload, {
      expiresIn: '3d',
      secret: process.env.JWT_SECRET,
    });
    return token;
  }

  async generateHash(password: string): Promise<string> {
    const salt = await genSalt(10);
    return await hash(password, salt);
  }

  comparePassword(password: string, passwordHash: string): boolean {
    return compareSync(password, passwordHash);
  }

  async signup(payload: SignUpDTO): Promise<BaseResponseDTO> {
    if (
      await this.prisma.user.findFirst({
        where: {
          email: {
            equals: payload.email,
            mode: 'insensitive',
          },
        },
      })
    ) {
      throw new ConflictException('user with email already exist');
    }
    const user = await this.prisma.user.create({
      data: {
        email: payload.email.toLowerCase(),
        name: payload.name,
        gender: payload.gender,
        phoneNumber: payload.phoneNumber,
        passwordHash: await this.generateHash(payload.password),
      },
    });
    return {
      status: true,
      message: 'Signup Successful',
      type: 'object',
      data: omit(user, ['passwordHash']),
    };
  }

  async login(payload: LoginDTO): Promise<BaseResponseDTO> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: {
          equals: payload.email,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        gender: true,
        phoneNumber: true,
        role: true,
        createdAt: true,
        passwordHash: true,
      },
    });
    // eslint-disable-next-line prettier/prettier
    if(!user || !this.comparePassword(payload.password, user.passwordHash)){
      throw new ForbiddenException('incorrect email or password');
    }

    return {
      status: true,
      message: 'Login successful',
      type: 'object',
      data: {
        ...omit(user, ['passwordHash']),
        token: this.generateAuthToken({
          email: user.email,
          id: user.id,
          role: user.role,
        }),
      },
    };
  }

  async forgotPassword(email: string): Promise<BaseResponseDTO> {
    return {
      status: true,
      message: 'Password reset set' + email,
    };
  }

  async resetPassword(
    userId: string,
    newPassword: string,
  ): Promise<BaseResponseDTO> {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        passwordHash: await this.generateHash(newPassword),
      },
    });

    return {
      status: true,
      message: 'password reset successfully',
    };
  }
}
