import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './api/v1/user/user.module';
import { AnnotationsModule } from './api/v1/annotations/annotations.module';
import { DatabaseModule } from './database/database.module';
import { ResponsesModule } from './api/v1/responses/responses.module';
import { AchievementModule } from './api/v1/achievement/achievement.module';
import { SendGridService } from './sendgrid/sendgrid.service';
import { SwipeAnswersModule } from './api/v1/swipe-answers/swipe-answers.module';
import { CategoryModule } from './api/v1/category/category.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      global: true,
      secret: `${process.env.JWT_ACCESS_SECRET}`,
      signOptions: { expiresIn: '1d' },
    }),
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        dbName: `${process.env.MONGODB_DB}`,
      }),
      inject: [ConfigService],
    }),
    DatabaseModule,
    UserModule,
    AnnotationsModule,
    ResponsesModule,
    AchievementModule,
    SwipeAnswersModule,
    CategoryModule,
  ],
  controllers: [AppController],
  providers: [AppService, SendGridService],
})
export class AppModule {}
