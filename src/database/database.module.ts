import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelDefinition } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/api/v1/user/schema/user.schema';

const mongooseModels: Array<ModelDefinition> = [
  { name: User.name, schema: UserSchema },
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
