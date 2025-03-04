import { Module } from '@nestjs/common';
import { SwipeAnswersService } from './swipe-answers.service';
import { SwipeAnswersController } from './swipe-answers.controller';
import { DatabaseModule } from 'src/database/database.module';
import { AnnotationsModule } from '../annotations/annotations.module';
import { PlayerCardService } from '../user/player-card/player-card.service';
import { AnnotationsService } from '../annotations/annotations.service';
import { AchievementsService } from '../achievement/achievement.service';
import { CategoryService } from '../category/category.service';

@Module({
  imports: [DatabaseModule, AnnotationsModule],
  controllers: [SwipeAnswersController],
  providers: [
    SwipeAnswersService,
    SwipeAnswersController,
    PlayerCardService,
    AnnotationsService,
    AchievementsService,
    CategoryService,
  ],
  exports: [SwipeAnswersService, SwipeAnswersController],
})
export class SwipeAnswersModule {}
