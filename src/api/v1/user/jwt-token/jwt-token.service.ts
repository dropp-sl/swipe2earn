import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createCipheriv, randomBytes, createHash } from 'crypto';

@Injectable()
export class JwtTokenService {
  constructor(private readonly jwtService: JwtService) {}

  async generateEncryptionPayload(data: any) {
    const userHashed = await this.encryptData(JSON.stringify(data));
    const payload = {
      sub: data?.userId,
      userInfo: userHashed,
    };
    return payload;
  }

  async generateSignUpToken(email: string) {
    const payload = {
      sub: email,
      user: {
        email,
      },
    };
    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
    });
    return token;
  }

  async generateForgotPasswordToken(user: any) {
    const payload = {
      sub: user?._id,
      user: {
        userId: user?._id,
        email: user?.email,
        encodeURI: user?.password,
      },
    };
    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '1h',
    });
    return token;
  }

  async generateEmailVerificationToken(user: any) {
    const payload = {
      sub: user?._id,
      user: {
        userId: user?._id,
        email: user?.email,
      },
    };
    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_EMAIL_SECRET,
      expiresIn: '1d',
    });
    return token;
  }

  async generateAccessToken(user: any) {
    try {
      const payload = await this.generateEncryptionPayload({
        userId: user?._id,
        email: user?.email,
      });
      const accessToken = await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '7d',
        algorithm: 'HS512',
      });
      const refreshToken = await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '30d',
        algorithm: 'HS512',
      });
      return { payload, accessToken, refreshToken };
    } catch (error) {
      console.error(error);
    }
  }

  async generateVerifyEmailToken(user: any) {
    const payload = {
      sub: user?._id,
      user: {
        email: user?.email,
        id: user?._id,
      },
    };
    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_EMAIL_SECRET,
      expiresIn: '1d',
      algorithm: 'HS512',
    });
    return token;
  }

  async decryptVerifyEmailToken(token: string) {
    return await this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_EMAIL_SECRET,
    });
  }

  async decryptAccessToken(token: string) {
    return await this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_ACCESS_SECRET,
    });
  }

  async decryptForgotToken(token: string): Promise<any> {
    return await this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_ACCESS_SECRET,
    });
  }

  async decryptSignUpToken(token: string): Promise<any> {
    return await this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_ACCESS_SECRET,
    });
  }

  async decryptRefreshToken(token: string): Promise<any> {
    return await this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_REFRESH_SECRET,
    });
  }

  async encryptData(data: string): Promise<any> {
    const key = createHash('sha256')
      .update(process.env.USER_ENCRYPT_KEY)
      .digest('base64')
      .substr(0, 32);
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-ctr', key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return (
      iv.toString('base64') +
      ':' +
      Buffer.from(encrypted, 'hex').toString('base64')
    );
  }
}
