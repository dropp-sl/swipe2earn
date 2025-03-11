import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelDefinition } from '@nestjs/mongoose';
import {
  Achievement,
  AchievementSchema,
} from 'src/api/v1/achievement/schema/achievement.schema';
import {
  Annotations,
  AnnotationsSchema,
} from 'src/api/v1/annotations/schema/annotations.schema';
import {
  Category,
  CategorySchema,
} from 'src/api/v1/category/schemas/category.schema';
import {
  Response,
  ResponseSchema,
} from 'src/api/v1/responses/schema/responses.schema';
import {
  SwipeAnswer,
  SwipeAnswerSchema,
} from 'src/api/v1/swipe-answers/schemas/swipe-answers.schema';
import {
  PlayerCard,
  PlayerCardSchema,
} from 'src/api/v1/user/schema/player-card.schema';
import { User, UserSchema } from 'src/api/v1/user/schema/user.schema';

const mongooseModels: Array<ModelDefinition> = [
  { name: User.name, schema: UserSchema },
  { name: Annotations.name, schema: AnnotationsSchema },
  { name: Response.name, schema: ResponseSchema },
  { name: Achievement.name, schema: AchievementSchema },
  { name: PlayerCard.name, schema: PlayerCardSchema },
  { name: SwipeAnswer.name, schema: SwipeAnswerSchema },
  { name: Category.name, schema: CategorySchema },
];

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: `${process.env.MONGODB_URI}`,
        dbName: `${process.env.MONGODB_DB}`,
      }),
    }),
    MongooseModule.forFeature([...mongooseModels]),
  ],
  exports: [MongooseModule.forFeature([...mongooseModels])],
})
export class DatabaseModule {}
