import { Module } from '@nestjs/common';
import { AchievementController } from './achievement.controller';
import { AchievementsService } from './achievement.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [AchievementsService],
  controllers: [AchievementController],
})
export class AchievementModule {}
