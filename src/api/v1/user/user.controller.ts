import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Put,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RequestWithUser } from 'src/interfaces/request-user';
import handleErrorException from 'src/exception/error.exception';
import { IUser } from './interface/user.interface';
import {
  NEW_PASSWORD_SAME_AS_OLD,
  OLD_PASSWORD_NOT_MATCH,
  SOMETHING_WENT_WRONG_TRY_AGAIN,
  USER_NOT_FOUND,
} from 'src/constants/error.contant';
import ResponseHelper from 'src/utils/response-helper';
import * as bcrypt from 'bcrypt';
import { UpdatePasswordDto } from './dto/auth.dto';
import {
  USER_PASSWORD_UPDATE_SUCCESS,
  USER_PICTURE_REMOVED_SUCCESS,
  USER_PICTURE_UPDATE_SUCCESS,
} from 'src/constants/messages.contant';
import { FileInterceptor } from '@nestjs/platform-express';
// import { AwsS3Service } from 'src/aws-s3/aws-s3.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    // private readonly awsS3Service: AwsS3Service,
  ) {}

  @Get('')
  async getUserProfile(@Req() req: RequestWithUser) {
    return await handleErrorException(async () => {
      const user: IUser = await this.userService.findOne(
        req?.user?.userInfo?.userId,
      );

      if (!user) throw new HttpException(USER_NOT_FOUND, HttpStatus.NOT_FOUND);

      return ResponseHelper.CreateResponse(user, HttpStatus.OK);
    });
  }

  @Put('profile')
  async updateUserProfile(@Req() req: RequestWithUser) {
    return await handleErrorException(async () => {
      const user: IUser = await this.userService.findOne(
        req?.user?.userInfo?.userId,
      );

      if (!user) throw new HttpException(USER_NOT_FOUND, HttpStatus.NOT_FOUND);

      const updatedUser: IUser = await this.userService.update(
        req?.user?.userInfo?.userId,
        req.body,
      );

      if (!updatedUser)
        throw new HttpException(
          SOMETHING_WENT_WRONG_TRY_AGAIN,
          HttpStatus.BAD_REQUEST,
        );

      return ResponseHelper.CreateResponse(updatedUser, HttpStatus.OK);
    });
  }

  @Put('password')
  async changePassword(
    @Req() req: RequestWithUser,
    @Body() updatePassword: UpdatePasswordDto,
  ) {
    return await handleErrorException(async () => {
      const user: IUser = await this.userService.findOne(
        req?.user?.userInfo?.userId,
      );

      const isOldPasswordValid = await bcrypt.compare(
        updatePassword.oldPassword,
        user.password,
      );

      if (!isOldPasswordValid)
        throw new HttpException(OLD_PASSWORD_NOT_MATCH, HttpStatus.BAD_REQUEST);

      const isSamePassword = await bcrypt.compare(
        updatePassword.newPassword,
        user.password,
      );

      if (isSamePassword)
        throw new HttpException(
          NEW_PASSWORD_SAME_AS_OLD,
          HttpStatus.BAD_REQUEST,
        );

      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(updatePassword.newPassword, salt);

      const updatedUser = await this.userService.update(
        req?.user?.userInfo?.userId,
        { password: hashPassword },
      );

      if (!updatedUser)
        throw new HttpException(
          SOMETHING_WENT_WRONG_TRY_AGAIN,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );

      return ResponseHelper.CreateResponse(
        updatedUser,
        HttpStatus.OK,
        USER_PASSWORD_UPDATE_SUCCESS,
      );
    });
  }

  @Put('profile-image')
  @UseInterceptors(FileInterceptor('image'))
  async updateProfilePicture(
    @Req() req: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await handleErrorException(async () => {
      const user: IUser = await this.userService.findOne(
        req?.user?.userInfo?.userId,
      );

      let pictureUrl: string = null;

      if (user?.picture) {
        const fileKey = user.picture.split('/').pop();
        // await this.awsS3Service.deleteImage(fileKey);
      }

      //   if (file) pictureUrl = await this.awsS3Service.uploadImage(file);

      const updatedUser = await this.userService.update(
        req?.user?.userInfo?.userId,
        { picture: pictureUrl },
      );

      if (!updatedUser)
        throw new HttpException(
          SOMETHING_WENT_WRONG_TRY_AGAIN,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );

      const message = pictureUrl
        ? USER_PICTURE_UPDATE_SUCCESS
        : USER_PICTURE_REMOVED_SUCCESS;

      return ResponseHelper.CreateResponse(updatedUser, HttpStatus.OK, message);
    });
  }
}
