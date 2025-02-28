import { Body, Controller, Get, HttpStatus, Post, Query } from '@nestjs/common';
import { AnnotationsService } from './annotations.service';
import { CreateAnnotationsDto } from './dto/annotations.dto';
import handleErrorException from 'src/exception/error.exception';
import ResponseHelper from 'src/utils/response-helper';

@Controller('annotations')
export class AnnotationsController {
  constructor(private readonly annotationsService: AnnotationsService) {}

  @Get()
  async findAll(@Query('page') page = 0, @Query('limit') limit = 10) {
    return await handleErrorException(async () => {
      const generations = await this.annotationsService.findAll(page, limit);
      return ResponseHelper.CreateResponse(generations, HttpStatus.OK);
    });
  }

  @Post()
  async create(@Body() generationsList: CreateAnnotationsDto[]) {
    return await handleErrorException(async () => {
      const result = await this.annotationsService.create(generationsList);
      return ResponseHelper.CreateResponse(result, HttpStatus.CREATED);
    });
  }
}
