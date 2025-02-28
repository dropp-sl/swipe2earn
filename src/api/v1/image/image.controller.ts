import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { ImageService } from './image.service';
import { CreateImageDto } from './dto/image.dto';
import handleErrorException from 'src/exception/error.exception';
import ResponseHelper from 'src/utils/response-helper';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post()
  async create(@Body() imageData: CreateImageDto) {
    return await handleErrorException(async () => {
      const imageUrl = await this.imageService.generateImage(imageData.prompt);
      const result = await this.imageService.create(imageData, imageUrl);
      return ResponseHelper.CreateResponse(result, HttpStatus.CREATED);
    });
  }
}
