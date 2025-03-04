import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SwipeAnswersService } from './swipe-answers.service';
import { SubmitSwipeAnswerDto } from './dto/swipe-answers.dto';
import { PlayerCardService } from '../user/player-card/player-card.service';
import { AnnotationsService } from '../annotations/annotations.service';
import handleErrorException from 'src/exception/error.exception';
import { RequestWithUser } from 'src/interfaces/request-user';
import { SOMETHING_WENT_WRONG_TRY_AGAIN } from 'src/constants/error.contant';
import { AuthGuard } from 'src/guards/auth.guard';
import ResponseHelper from 'src/utils/response-helper';
import { CategoryService } from '../category/category.service';
import { ICategory } from '../category/interface/category.interface';
import { ISwipeAnswer } from './interface/swipe-answers.interface';
import { IPlayerCard } from '../user/interface/player-card.interface';
import { Types } from 'mongoose';

@UseGuards(AuthGuard)
@Controller('swipe-answers')
export class SwipeAnswersController {
  constructor(
    private readonly swipeAnswersService: SwipeAnswersService,
    private readonly playerCardService: PlayerCardService,
    private readonly annotationsService: AnnotationsService,
    private readonly categoryService: CategoryService,
  ) {}

  @Get('getSwipeAnswersByUserId')
  async getAllSwipeAnswersByUserId(@Req() req: RequestWithUser) {
    return await handleErrorException(async () => {
      const swipeAnswers: ISwipeAnswer[] =
        await this.swipeAnswersService.getSwipeAnswersByUserId(
          req?.user?.userInfo?.userId,
        );

      return ResponseHelper.CreateResponse(
        swipeAnswers,
        HttpStatus.OK,
        'Swipe answers retrieved successfully.',
      );
    });
  }

  @Post('submitSwipeAnswer')
  async submitSwipeAnswer(
    @Body() data: SubmitSwipeAnswerDto,
    @Req() req: RequestWithUser,
  ) {
    return await handleErrorException(async () => {
      try {
        const annotation = await this.annotationsService.findOne({
          _id: data.annotationsId,
        });

        if (!annotation)
          throw new HttpException(
            'Annotation not found',
            HttpStatus.BAD_REQUEST,
          );

        for (const meta of data.metadata) {
          const categoryExists: ICategory =
            await this.categoryService.findCategoryById(meta.category);

          if (!categoryExists)
            return {
              status: HttpStatus.BAD_REQUEST,
              error: `Category ID ${meta.category} does not exist. Please select an existing category or create a new one.`,
            };
        }

        const userMongoId = new Types.ObjectId(req?.user?.userInfo?.userId);
        const isCorrect = annotation.ipExists === data.answer;

        if (isCorrect && data.answer)
          if (!data.metadata || data.metadata.length === 0)
            throw new HttpException(
              'Annotation(s) is required for correct answers',
              HttpStatus.BAD_REQUEST,
            );

        let userPlayCard: IPlayerCard =
          await this.playerCardService.getPlayerByUserId(
            req?.user?.userInfo?.userId,
          );

        if (!userPlayCard)
          userPlayCard = await this.playerCardService.createPlayerCard(
            req?.user?.userInfo?.userId,
          );

        const annotationAnswersCount = await this.swipeAnswersService.count({
          annotationsId: data.annotationsId,
        });

        const newSwipeAnswer: ISwipeAnswer =
          await this.swipeAnswersService.createSwipeAnswers({
            ...data,
            points: isCorrect ? 500 : 0,
            userId: userMongoId,
          });

        const updateAnnotation = await this.annotationsService.update(
          { _id: data.annotationsId },
          {
            $push: { userIds: req?.user?.userInfo?.userId },
            available: annotationAnswersCount < 100,
          },
        );

        if (!updateAnnotation)
          throw new HttpException(
            SOMETHING_WENT_WRONG_TRY_AGAIN,
            HttpStatus.BAD_REQUEST,
          );

        if (!isCorrect)
          return ResponseHelper.CreateResponse(
            {
              isCorrect: false,
              swipeAnswer: newSwipeAnswer,
              userPlayCard,
            },
            HttpStatus.OK,
            `Answer submitted, but no metadata needed since it's incorrect.`,
          );

        userPlayCard = await this.playerCardService.updateCardById(
          {
            userId: userMongoId,
          },
          {
            points: userPlayCard.points + 500,
          },
        );

        if (!newSwipeAnswer)
          throw new HttpException(
            'Failed to submit answer',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );

        return ResponseHelper.CreateResponse(
          {
            isCorrect,
            swipeAnswer: newSwipeAnswer,
            userPlayCard,
          },
          HttpStatus.OK,
          'Answer submitted successfully.',
        );
      } catch (error) {
        console.error(error);
        throw new HttpException(
          error || error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    });
  }
}
