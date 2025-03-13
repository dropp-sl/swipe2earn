import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { UserService } from '../user.service';
import handleErrorException from 'src/exception/error.exception';
import {
  ForgotDto,
  LoginUserDto,
  RegisterDto,
  ResendVerificationEmailDto,
  ResetPasswordDto,
} from '../dto/auth.dto';
import { IUser } from '../interface/user.interface';
import { JwtTokenService } from '../jwt-token/jwt-token.service';
import {
  EMAIL_ALREADY_VERIFIED,
  EMAIL_NOT_VERIFIED,
  INVALID_PASSWORD,
  ONE_TIME_TOKEN_EXPIRED,
  SOMETHING_WENT_WRONG_TRY_AGAIN,
  USER_ACCOUNT_NOT_FOUND,
  USER_ACCOUNT_STATUS_INACTIVE,
  USER_ALREADY_EXIST_WITH_EMAIL,
  USERNAME_ALREADY_TAKEN,
} from 'src/constants/error.contant';
import * as bcrypt from 'bcrypt';
import { UserStatus } from 'src/utils/enum';
import ResponseHelper from 'src/utils/response-helper';
import {
  EMAIL_VERIFICATION_SENT_MESSAGE,
  EMAIL_VERIFICATION_SUCCESS,
  FORGOT_PASSWORD_EMAIL_SENT_MESSAGE,
  PASSWORD_CHANGED_MESSAGE,
  USER_SIGNUP_SUCCESS,
} from 'src/constants/messages.contant';
import { SendGridService } from 'src/sendgrid/sendgrid.service';
import { PlayerCardService } from '../player-card/player-card.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly sendgridService: SendGridService,
    private readonly playerCardService: PlayerCardService,
  ) {}

  @Get('verify-email/:token')
  async verifyEmail(@Param('token') token: string) {
    return await handleErrorException(async () => {
      const userInfo =
        await this.jwtTokenService.decryptVerifyEmailToken(token);
      const user: IUser = await this.userService.findOne(
        userInfo?.user?.userId,
      );

      if (!user)
        throw new HttpException(USER_ACCOUNT_NOT_FOUND, HttpStatus.BAD_REQUEST);

      if (user.isVerified)
        throw new HttpException(EMAIL_ALREADY_VERIFIED, HttpStatus.BAD_REQUEST);

      const updatedUser = await this.userService.update(user._id, {
        isVerified: true,
      });

      if (!updatedUser)
        throw new HttpException(
          SOMETHING_WENT_WRONG_TRY_AGAIN,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );

      return ResponseHelper.CreateResponse(
        null,
        HttpStatus.OK,
        EMAIL_VERIFICATION_SUCCESS,
      );
    });
  }

  @Post('register')
  async register(@Body() registerUserDto: RegisterDto) {
    return await handleErrorException(async () => {
      const emailExists: IUser = await this.userService.findByEmail(
        registerUserDto.email,
      );

      if (emailExists?._id)
        throw new HttpException(
          USER_ALREADY_EXIST_WITH_EMAIL,
          HttpStatus.BAD_REQUEST,
        );

      const usernameExists: IUser = await this.userService.findByUsername(
        registerUserDto.username,
      );

      if (usernameExists?._id)
        throw new HttpException(USERNAME_ALREADY_TAKEN, HttpStatus.BAD_REQUEST);

      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(registerUserDto.password, salt);

      const user: IUser = await this.userService.create({
        ...registerUserDto,
        password: hashPassword,
        status: UserStatus.ACTIVE,
      });

      const userPlayCard = await this.playerCardService.createPlayerCard(
        user?._id?.toString(),
      );

      const token =
        await this.jwtTokenService.generateEmailVerificationToken(user);
      this.sendgridService.verifyEmail(user, token);

      return ResponseHelper.CreateResponse(
        { user, userPlayCard },
        HttpStatus.CREATED,
        USER_SIGNUP_SUCCESS,
      );
    });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginUserDto): Promise<any> {
    return await handleErrorException(async () => {
      let user: IUser;

      if (body?.email) user = await this.userService.findByEmail(body.email);
      else if (body?.username)
        user = await this.userService.findByUsername(body.username);

      if (!user)
        throw new HttpException(USER_ACCOUNT_NOT_FOUND, HttpStatus.BAD_REQUEST);

      if (user?.status === UserStatus.INACTIVE)
        throw new HttpException(
          USER_ACCOUNT_STATUS_INACTIVE,
          HttpStatus.BAD_REQUEST,
        );

      if (!user?.isVerified) {
        const token =
          await this.jwtTokenService.generateEmailVerificationToken(user);
        this.sendgridService.verifyEmail(user, token);

        throw new HttpException(EMAIL_NOT_VERIFIED, HttpStatus.BAD_REQUEST);
      }

      const isMatch = await bcrypt.compare(body?.password, user?.password);

      if (!isMatch)
        throw new HttpException(INVALID_PASSWORD, HttpStatus.BAD_REQUEST);

      await this.userService.update(user._id, { lastLogin: new Date() });

      const { payload, accessToken, refreshToken } =
        await this.jwtTokenService.generateAccessToken(user);

      return ResponseHelper.CreateResponse(
        { user, payload, accessToken, refreshToken },
        HttpStatus.OK,
        USER_SIGNUP_SUCCESS,
      );
    });
  }

  @Post('resend-verification-email')
  async resendVerificationEmail(
    @Body() resendVerificationEmail: ResendVerificationEmailDto,
  ) {
    return await handleErrorException(async () => {
      const user = await this.userService.findByEmail(
        resendVerificationEmail.email,
      );

      if (!user)
        throw new HttpException(USER_ACCOUNT_NOT_FOUND, HttpStatus.BAD_REQUEST);

      if (user.isVerified)
        throw new HttpException(EMAIL_ALREADY_VERIFIED, HttpStatus.BAD_REQUEST);

      const token =
        await this.jwtTokenService.generateEmailVerificationToken(user);

      if (!token)
        throw new HttpException(
          SOMETHING_WENT_WRONG_TRY_AGAIN,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );

      return ResponseHelper.CreateResponse(
        null,
        HttpStatus.OK,
        EMAIL_VERIFICATION_SENT_MESSAGE,
      );
    });
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotDto: ForgotDto) {
    return await handleErrorException(async () => {
      const user: any = await this.userService.findByEmail(forgotDto.email);

      if (!user)
        throw new HttpException(USER_ACCOUNT_NOT_FOUND, HttpStatus.BAD_REQUEST);

      const token =
        await this.jwtTokenService.generateForgotPasswordToken(user);
      await this.sendgridService.forgotPasswordEmail(user, token);

      return ResponseHelper.CreateResponse(
        null,
        HttpStatus.OK,
        FORGOT_PASSWORD_EMAIL_SENT_MESSAGE,
      );
    });
  }

  @Post('reset-password')
  async resetPassword(@Body() resetDto: ResetPasswordDto) {
    return await handleErrorException(async () => {
      const decryptedToken = await this.jwtTokenService.decryptForgotToken(
        resetDto.token,
      );

      const user: IUser = await this.userService.findOne(
        decryptedToken?.user?.userId,
      );

      if (!user)
        throw new HttpException(USER_ACCOUNT_NOT_FOUND, HttpStatus.BAD_REQUEST);

      if (decryptedToken?.user?.encodeURI !== user?.password && user?.password)
        throw new HttpException(
          ONE_TIME_TOKEN_EXPIRED,
          HttpStatus.UNAUTHORIZED,
        );

      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(resetDto.password, salt);

      await this.userService.update(decryptedToken?.user?.userId, {
        password: hashPassword,
        passwordExists: true,
      });

      return ResponseHelper.CreateResponse(
        null,
        HttpStatus.OK,
        PASSWORD_CHANGED_MESSAGE,
      );
    });
  }
}
