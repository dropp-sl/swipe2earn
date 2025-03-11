import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AnnotationsService } from './annotations.service';
import { CreateAnnotationsDto } from './dto/annotations.dto';
import handleErrorException from 'src/exception/error.exception';
import ResponseHelper from 'src/utils/response-helper';
import { PromptService } from './prompt/prompt.service';
import { ImageService } from './image/image.service';
import { SOMETHING_WENT_WRONG_TRY_AGAIN } from 'src/constants/error.contant';
import { IAnnotation } from './interface/annotations.interface';
import { RequestWithUser } from 'src/interfaces/request-user';
import { Types } from 'mongoose';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('annotations')
export class AnnotationsController {
  constructor(
    private readonly annotationsService: AnnotationsService,
    private readonly promptService: PromptService,
    private readonly imageService: ImageService,
  ) {}

  @UseGuards(AuthGuard)
  @Get('one')
  async getOneRandom(@Req() req: RequestWithUser) {
    return await handleErrorException(async () => {
      const annotation: IAnnotation =
        await this.annotationsService.findOneRandom(req.user.userInfo.userId);
      return ResponseHelper.CreateResponse(annotation, HttpStatus.OK);
    });
  }

  @Get('all')
  async findAll(@Query('page') page = 0, @Query('limit') limit = 10) {
    return await handleErrorException(async () => {
      const generations = await this.annotationsService.findAll(page, limit);
      return ResponseHelper.CreateResponse(generations, HttpStatus.OK);
    });
  }

  @Post()
  async create(@Body() generationsList: CreateAnnotationsDto[]) {
    return await handleErrorException(async () => {
      const result: IAnnotation =
        await this.annotationsService.createAnnotations(generationsList);

      if (!result)
        throw new HttpException(
          SOMETHING_WENT_WRONG_TRY_AGAIN,
          HttpStatus.BAD_REQUEST,
        );

      return ResponseHelper.CreateResponse(result, HttpStatus.CREATED);
    });
  }

  @Put('update')
  async update(@Body() id: string, @Req() req: RequestWithUser) {
    return await handleErrorException(async () => {
      const result: IAnnotation = await this.annotationsService.update(
        {
          _id: id,
          userIds: { $nin: [new Types.ObjectId(req?.user?.userInfo?.userId)] },
        },
        {
          $push: { userIds: new Types.ObjectId(req?.user?.userInfo?.userId) },
        },
      );

      if (!result)
        throw new HttpException(
          SOMETHING_WENT_WRONG_TRY_AGAIN,
          HttpStatus.BAD_REQUEST,
        );

      return ResponseHelper.CreateResponse(result, HttpStatus.OK);
    });
  }

  @Get('generate')
  async generateAnnotations(): Promise<{
    message: string;
    totalGenerated: number;
    failedCount: number;
  }> {
    return await handleErrorException(async () => {
      const batchSize = 50; // 10 IP + 10 Non-IP
      let successCount = 0;
      let failedCount = 0;

      console.log('Generating prompts...');
      const { ipPrompts, nonIpPrompts } = await this.promptService.batchPrompts(
        batchSize * 2,
      );

      console.log(
        `Generated ${ipPrompts.length} IP prompts and ${nonIpPrompts.length} non-IP prompts.`,
      );

      const generatedAnnotations: IAnnotation[] = [];

      // Process IP prompts
      for (const [index, prompt] of ipPrompts.entries()) {
        try {
          console.log(`Processing IP Prompt ${index + 1}/${ipPrompts.length}`);
          const imageUrl =
            await this.imageService.generateImageWithOpenAI(prompt);
          const annotation: IAnnotation =
            await this.annotationsService.createAnnotation({
              prompt,
              imageUrl,
              ipExists: false,
              available: true,
            });
          generatedAnnotations.push(annotation);
          successCount++;
        } catch (error) {
          console.error(
            `❌ Failed to generate image for IP Prompt ${index + 1}: ${error.message}`,
          );
          failedCount++;
          continue; // Move on to the next prompt
        }
      }

      // Process Non-IP prompts
      for (const [index, prompt] of nonIpPrompts.entries()) {
        try {
          console.log(
            `Processing Non-IP Prompt ${index + 1}/${nonIpPrompts.length}`,
          );
          const imageUrl =
            await this.imageService.generateImageWithOpenAI(prompt);
          const annotation: IAnnotation =
            await this.annotationsService.createAnnotation({
              prompt,
              imageUrl,
              ipExists: false,
              available: true,
            });
          generatedAnnotations.push(annotation);
          successCount++;
        } catch (error) {
          console.error(
            `❌ Failed to generate image for Non-IP Prompt ${index + 1}: ${error.message}`,
          );
          failedCount++;
          continue; // Move on to the next prompt
        }
      }

      console.log(
        `✅ Annotation generation completed. Success: ${successCount}, Failed: ${failedCount}`,
      );

      return {
        message: 'Annotation generation completed.',
        totalGenerated: successCount,
        failedCount: failedCount,
      };
    });
  }
}
