import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { ResponsesService } from './responses.service';
import { CreateResponseDto } from './dto/responses.dto';
import handleErrorException from 'src/exception/error.exception';
import ResponseHelper from 'src/utils/response-helper';

@Controller('responses')
export class ResponsesController {
  constructor(private readonly responsesService: ResponsesService) {}

  @Post()
  async submitResponse(@Body() createResponseDto: CreateResponseDto) {
    return await handleErrorException(async () => {
      const response =
        await this.responsesService.submitResponse(createResponseDto);
      return ResponseHelper.CreateResponse(response, HttpStatus.CREATED);
    });
  }
}
