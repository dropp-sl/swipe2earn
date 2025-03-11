import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Annotations, AnnotationsDocument } from './schema/annotations.schema';
import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';
import { CreateAnnotationsDto } from './dto/annotations.dto';
import OpenAI from 'openai';

@Injectable()
export class AnnotationsService {
  private openai: OpenAI;

  constructor(
    @InjectModel(Annotations.name)
    private readonly annotationsModel: Model<AnnotationsDocument>,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async findOneRandom(userId: string): Promise<any> {
    return this.annotationsModel
      .aggregate([
        {
          $match: {
            userIds: { $nin: [new Types.ObjectId(userId)] },
          },
        },
        { $sample: { size: 1 } },
      ])
      .exec();
  }

  async generateAnnotation(): Promise<any> {
    // 1. Generate a text prompt using OpenAI
    const promptResponse = await this.openai.completions.create({
      model: 'gpt-4', // or 'gpt-3.5-turbo'
      prompt: 'Generate a creative prompt for an AI-generated image.',
      max_tokens: 50,
    });

    const prompt = promptResponse.choices[0].text.trim();

    // 2. Use the generated prompt to create an AI image (DALL·E)
    const imageResponse = await this.openai.images.generate({
      model: 'dall-e-2',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
    });

    const imageUrl = imageResponse.data[0].url;

    // 3. Store the complete annotation in MongoDB
    const annotation = await this.annotationsModel.create({
      prompt,
      imageUrl,
      ipExists: true,
      metadata: null,
    });

    return annotation;
  }

  async findAll(page: number, limit: number): Promise<any> {
    const skip = page * limit;
    return this.annotationsModel.find().skip(skip).limit(limit).exec();
  }

  async update(
    filter: FilterQuery<AnnotationsDocument>,
    data: UpdateQuery<AnnotationsDocument>,
  ): Promise<any> {
    return await this.annotationsModel
      .updateOne(filter, data, { new: true })
      .exec();
  }

  async findOne(filter: any): Promise<any> {
    return this.annotationsModel.findOne(filter).exec();
  }

  async createAnnotation(annotationData: CreateAnnotationsDto): Promise<any> {
    return this.annotationsModel.create(annotationData);
  }

  async createAnnotations(
    generationsList: CreateAnnotationsDto[],
  ): Promise<any> {
    return this.annotationsModel.insertMany(generationsList);
  }
}
