import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SwipeAnswer } from './schemas/swipe-answers.schema';
import { FilterQuery, Model, Types } from 'mongoose';

@Injectable()
export class SwipeAnswersService {
  constructor(
    @InjectModel(SwipeAnswer.name)
    private readonly swipeAnswersModel: Model<SwipeAnswer>,
  ) {}

  async getSwipeAnswersByUserId(userId: string): Promise<any[]> {
    return this.swipeAnswersModel.find({ userId: new Types.ObjectId(userId) });
  }

  async getSwipeAnswersByAnnotaionId(annotationId: string): Promise<any[]> {
    return this.swipeAnswersModel.find({ annotationId: annotationId });
  }

  async getSwipeAnswerById(id: string): Promise<any> {
    return this.swipeAnswersModel.findById(id);
  }

  async createSwipeAnswers(swipeAnswers: Partial<any>): Promise<any> {
    return await this.swipeAnswersModel.create(swipeAnswers);
  }

  async updateSwipeAnswers(
    id: string,
    swipeAnswers: SwipeAnswer,
  ): Promise<any> {
    return this.swipeAnswersModel.findByIdAndUpdate(id, swipeAnswers, {
      new: true,
    });
  }

  async deleteSwipeAnswers(id: string): Promise<any> {
    return this.swipeAnswersModel.findByIdAndDelete(id);
  }

  async count(filter: FilterQuery<any>): Promise<number> {
    return await this.swipeAnswersModel.countDocuments({ ...filter });
  }
}
