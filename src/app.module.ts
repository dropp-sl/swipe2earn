import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './api/v1/user/user.module';
import { AnnotationsModule } from './api/v1/annotations/annotations.module';
import { PromptModule } from './api/v1/prompt/prompt.module';
import { ImageModule } from './api/v1/image/image.module';

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
    UserModule,
    AnnotationsModule,
    PromptModule,
    ImageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
