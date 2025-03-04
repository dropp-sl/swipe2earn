import { Model } from 'mongoose';
import { Achievement, AchievementDocument } from './schema/achievement.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import {
  CreateAchievementDto,
  UpdateAchievementDto,
} from './dto/achievement.dto';

@Injectable()
export class AchievementsService {
  constructor(
    @InjectModel(Achievement.name)
    private achievementModel: Model<AchievementDocument>,
  ) {}

  async create(dto: CreateAchievementDto): Promise<any> {
    const achievement = new this.achievementModel(dto);
    return achievement.save();
  }

  async findAll(): Promise<Achievement[]> {
    return this.achievementModel.find().exec();
  }

  async findByName(name: string): Promise<any | null> {
    return this.achievementModel.findOne({ name }).exec();
  }

  async update(id: string, dto: UpdateAchievementDto): Promise<any> {
    return this.achievementModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<void> {
    await this.achievementModel.findByIdAndDelete(id).exec();
  }
}
