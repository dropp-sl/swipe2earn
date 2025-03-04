import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { NodeHttpHandler } from '@aws-sdk/node-http-handler';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ObjectCannedACL,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { ERROR_DELETE, ERROR_UPLOAD } from 'src/constants/error.contant';
import { Agent } from 'https';

@Injectable()
export class AwsS3Service {
  private readonly s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.S3_BUCKET_REGION,
      credentials: {
        accessKeyId: process.env.S3_BUCKET_ACCESS_KEY,
        secretAccessKey: process.env.S3_BUCKET_SECRET_ACCESS_KEY,
      },
      requestHandler: new NodeHttpHandler({
        httpsAgent: new Agent({
          keepAlive: true,
        }),
      }),
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    return this.uploadFile(file, 'images');
  }

  async deleteImage(key: string): Promise<void> {
    return this.deleteFile(key, 'images');
  }

  async uploadGeneratedImage(file: Express.Multer.File): Promise<string> {
    try {
      await this.uploadFile(file, 'generated-images');
      return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_BUCKET_REGION}.amazonaws.com/${file.filename}.png`;
    } catch (error) {
      console.error(ERROR_UPLOAD, error);
      throw new HttpException(ERROR_UPLOAD, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async uploadFile(file: any, folder: string): Promise<string> {
    const fileKey = `${folder}/${uuidv4()}-${file?.originalname?.trim()}`;

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: ObjectCannedACL.public_read,
    };

    try {
      await this.s3Client.send(new PutObjectCommand(params));
      return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_BUCKET_REGION}.amazonaws.com/${fileKey}`;
    } catch (error) {
      console.error(ERROR_UPLOAD, error);
      throw new HttpException(ERROR_UPLOAD, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async deleteFile(key: string, folder: string): Promise<void> {
    const fileKey = `${folder}/${key}`;

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileKey,
    };

    try {
      await this.s3Client.send(new DeleteObjectCommand(params));
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw new HttpException(ERROR_DELETE, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
