import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { PromptService } from './prompt.service';
import { CreatePromptDto } from './dto/prompt.dto';
import handleErrorException from 'src/exception/error.exception';
import ResponseHelper from 'src/utils/response-helper';

@Controller('prompts')
export class PromptController {
  constructor(private readonly promptService: PromptService) {}

  @Post()
  async create(@Body() promptData: CreatePromptDto) {
    return await handleErrorException(async () => {
      const result = await this.promptService.create(promptData);
      return ResponseHelper.CreateResponse(result, HttpStatus.CREATED);
    });
  }

  @Post('/generate')
  async generate(@Body() promptData: CreatePromptDto) {
    return await handleErrorException(async () => {
      const ipPrompts = await this.promptService.generatePrompts(
        promptData.ipPromptsBatchSize,
        true,
      );
      const nonIpPrompts = await this.promptService.generatePrompts(
        promptData.nonIpPromptsBatchSize,
        false,
      );
      return ResponseHelper.CreateResponse(
        { ipPrompts, nonIpPrompts },
        HttpStatus.OK,
      );
    });
  }
}
