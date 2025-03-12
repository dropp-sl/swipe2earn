import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model, SortOrder, Types } from 'mongoose';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { PlayerCard } from './schema/player-card.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(PlayerCard.name)
    private playerCardModel: Model<PlayerCard>,
  ) {}

  async findAll(): Promise<any[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findOne(id: string | Types.ObjectId): Promise<any> {
    const card = await this.playerCardModel
      .findOne({ userId: new Types.ObjectId(id) })
      .lean()
      .exec();
    const user = await this.userModel.findById(id).lean().exec();
    return { ...user, card };
  }

  async create(user: any): Promise<any> {
    return this.userModel.create(user);
  }

  async updateName(
    id: string | Types.ObjectId,
    data: UpdateUserDto,
  ): Promise<any> {
    return this.userModel
      .findByIdAndUpdate(
        id,
        {
          ...data,
        },
        { new: true },
      )
      .exec();
  }

  async update(id: string | Types.ObjectId, data: any): Promise<any> {
    return this.userModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async updateUserStatus(
    id: string | Types.ObjectId,
    status: string,
  ): Promise<any> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .lean()
      .exec();
    const card = await this.playerCardModel
      .findOne({ userId: user?._id })
      .lean()
      .exec();
    return { ...user, card };
  }

  async findByEmail(email: string): Promise<any> {
    const user = await this.userModel.findOne({ email }).lean().exec();
    const card = await this.playerCardModel
      .findOne({ userId: user?._id })
      .lean()
      .exec();
    return { ...user, card };
  }

  async findByUsername(username: string): Promise<any> {
    const user = await this.userModel.findOne({ username }).lean().exec();
    const card = await this.playerCardModel
      .findOne({ userId: user?._id })
      .lean()
      .exec();
    return { ...user, card };
  }
}
