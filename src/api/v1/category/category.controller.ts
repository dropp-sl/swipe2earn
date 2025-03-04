import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/category.dto';
import handleErrorException from 'src/exception/error.exception';
import { SOMETHING_WENT_WRONG_TRY_AGAIN } from 'src/constants/error.contant';
import ResponseHelper from 'src/utils/response-helper';
import { ICategory } from './interface/category.interface';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('create')
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return await handleErrorException(async () => {
      const category: ICategory =
        await this.categoryService.createCategory(createCategoryDto);

      if (!category)
        throw new HttpException(
          SOMETHING_WENT_WRONG_TRY_AGAIN,
          HttpStatus.BAD_REQUEST,
        );

      return ResponseHelper.CreateResponse(category, HttpStatus.CREATED);
    });
  }

  @Get(':id')
  async getCategoryById(@Param('id') id: string) {
    return await handleErrorException(async () => {
      const category: ICategory =
        await this.categoryService.findCategoryById(id);

      if (!category)
        throw new HttpException('Category not found', HttpStatus.NOT_FOUND);

      return ResponseHelper.CreateResponse(category, HttpStatus.OK);
    });
  }

  @Get()
  async getAllCategories() {
    return await handleErrorException(async () => {
      const categories = await this.categoryService.getAllCategories();

      if (!categories || categories.length === 0)
        throw new HttpException('No categories found', HttpStatus.NOT_FOUND);

      return ResponseHelper.CreateResponse(categories, HttpStatus.OK);
    });
  }

  @Delete(':id')
  async deleteCategory(@Param('id') id: string) {
    return await handleErrorException(async () => {
      const exists = await this.categoryService.findCategoryById(id);

      if (!exists)
        throw new HttpException('Category not found', HttpStatus.NOT_FOUND);

      const category: ICategory = await this.categoryService.deleteCategory(id);

      if (!category)
        throw new HttpException('Category not found', HttpStatus.NOT_FOUND);

      return ResponseHelper.CreateResponse(
        { message: 'Category deleted successfully' },
        HttpStatus.OK,
      );
    });
  }
}
