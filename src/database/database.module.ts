import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelDefinition } from '@nestjs/mongoose';
import {
  Annotations,
  AnnotationsSchema,
} from 'src/api/v1/annotations/schema/annotations.schema';
import { Image, ImageSchema } from 'src/api/v1/image/schema/image.schema';
import { Prompt, PromptSchema } from 'src/api/v1/prompt/schema/prompt.schema';
import { User, UserSchema } from 'src/api/v1/user/schema/user.schema';

const mongooseModels: Array<ModelDefinition> = [
  { name: User.name, schema: UserSchema },
  { name: Annotations.name, schema: AnnotationsSchema },
  { name: Prompt.name, schema: PromptSchema },
  { name: Image.name, schema: ImageSchema },
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
