import { Injectable } from '@nestjs/common';
import { ImageDocument } from './schema/image.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateImageDto } from './dto/image.dto';

@Injectable()
export class ImageService {
  constructor(
    @InjectModel(Image.name)
    private readonly imageModel: Model<ImageDocument>,
  ) {}

  async create(imageData: CreateImageDto, imageUrl: string): Promise<any> {
    return this.imageModel.create({ ...imageData, imageUrl });
  }

  async generateImage(prompt: string): Promise<string> {
    const generatedImageUrl = `https://s3.amazonaws.com/generated-images/${prompt.replace(' ', '_')}.png`;
    return generatedImageUrl;
  }
}
