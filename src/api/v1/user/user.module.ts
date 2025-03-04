import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthController } from './auth/auth.controller';
import { DatabaseModule } from 'src/database/database.module';
import { PlayerCardService } from './player-card/player-card.service';
import { AchievementsService } from '../achievement/achievement.service';
import { JwtTokenService } from './jwt-token/jwt-token.service';
import { SendGridService } from 'src/sendgrid/sendgrid.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    UserService,
    PlayerCardService,
    AchievementsService,
    JwtTokenService,
    SendGridService,
    PlayerCardService,
  ],
  controllers: [UserController, AuthController],
})
export class UserModule {}
