import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model, SortOrder, Types } from 'mongoose';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async findAll(): Promise<any[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findAllWithPaginationAndSearch(
    page: number,
    limit: number,
    search: string,
  ): Promise<any[]> {
    return this.userModel
      .find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      })
      .select('-password')
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
  }

  async countAllWithSearch(search: string): Promise<number> {
    return this.userModel
      .find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      })
      .countDocuments();
  }

  async countAllWithFilter(filter: any): Promise<number> {
    return this.userModel.find(filter).countDocuments();
  }

  async totalUsers(): Promise<number> {
    return this.userModel.countDocuments();
  }

  async findWithPaginationAndCount(
    page: number,
    limit: number,
    search: string,
    name: string,
    registerDate: string,
  ): Promise<any> {
    let sort: { [key: string]: SortOrder | { $meta: any } } = {};
    const searchQuery = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    if (name) sort = { firstName: name === 'asc' ? 1 : -1 };
    else if (registerDate)
      sort = { createdAt: registerDate === 'asc' ? 1 : -1 };
    else sort = { createdAt: -1 };

    const [users, total] = await Promise.all([
      this.userModel
        .find(searchQuery)
        .sort(sort)
        .select('-password')
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.userModel.countDocuments(searchQuery),
    ]);

    return { users, total };
  }

  async updateOrderCountAndDate(userId: string): Promise<any> {
    return this.userModel
      .findByIdAndUpdate(userId, {
        ordersExist: true,
        $inc: { totalOrders: 1 },
        lastOrderDate: new Date(),
      })
      .exec();
  }

  async findOne(id: string | Types.ObjectId): Promise<any> {
    return this.userModel.findById(id).exec();
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
    return this.userModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();
  }

  async updateUserCustomerId(
    id: string | Types.ObjectId,
    customerId: string,
  ): Promise<any> {
    return this.userModel
      .findByIdAndUpdate(id, { customerId }, { new: true })
      .exec();
  }

  async findByEmail(email: string): Promise<any> {
    return this.userModel.findOne({ email }).exec();
  }
}
