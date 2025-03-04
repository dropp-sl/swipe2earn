import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCategoryDto } from './dto/category.dto';
import { Category } from './schemas/category.schema';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
  ) {}

  async createCategory(createCategoryDto: CreateCategoryDto): Promise<any> {
    return this.categoryModel.create(createCategoryDto);
  }

  async findCategoryByName(name: string): Promise<any> {
    return this.categoryModel.findOne({ name }).exec();
  }

  async findCategoryById(id: string): Promise<any> {
    return this.categoryModel.findById(id).exec();
  }

  async getAllCategories(): Promise<any[]> {
    return this.categoryModel.find().exec();
  }

  async deleteCategory(id: string): Promise<any> {
    return this.categoryModel.findByIdAndDelete(id);
  }
}
