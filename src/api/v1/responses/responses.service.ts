import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Response, ResponseDocument } from './schema/responses.schema';
import { User, UserDocument } from '../user/schema/user.schema';
import { CreateResponseDto } from './dto/responses.dto';

@Injectable()
export class ResponsesService {
  constructor(
    @InjectModel(Response.name)
    private readonly responseModel: Model<ResponseDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async submitResponse(dto: CreateResponseDto): Promise<any> {
    const response = await this.responseModel.create(dto);

    if (dto.isCorrect) {
      // Update user points
      await this.userModel.findByIdAndUpdate(dto.userId, {
        $inc: { points: 10 }, // Give 10 points per correct answer
      });
    }

    return response;
  }
}
