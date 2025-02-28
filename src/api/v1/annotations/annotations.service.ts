import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Annotations, AnnotationsDocument } from './schema/annotations.schema';
import { Model } from 'mongoose';
import { CreateAnnotationsDto } from './dto/annotations.dto';

@Injectable()
export class AnnotationsService {
  constructor(
    @InjectModel(Annotations.name)
    private readonly annotationsModel: Model<AnnotationsDocument>,
  ) {}

  async findAll(page: number, limit: number): Promise<any> {
    const skip = page * limit;
    return this.annotationsModel.find().skip(skip).limit(limit).exec();
  }

  async create(generationsList: CreateAnnotationsDto[]): Promise<any> {
    return this.annotationsModel.insertMany(generationsList);
  }
}
