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
import { IAnnotation } from '../annotations/interface/annotations.interface';

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
      const annotation: IAnnotation = await this.annotationsService.findOne({
        _id: data.annotationsId,
      });

      if (!annotation)
        throw new HttpException('Annotation not found', HttpStatus.BAD_REQUEST);

      if (data.metadata && data.metadata.length > 0)
        for (const meta of data.metadata) {
          if (!meta.label?.trim())
            throw new HttpException(
              `Bounding box annotation is missing a label. Please provide a valid label.`,
              HttpStatus.BAD_REQUEST,
            );

          for (const category of meta.categories) {
            const categoryExists: ICategory =
              await this.categoryService.findCategoryById(category);

            if (!categoryExists) {
              return {
                status: HttpStatus.BAD_REQUEST,
                error: `Category ID ${category} does not exist. Please select an existing category or create a new one.`,
              };
            }
          }
        }

      const userMongoId = new Types.ObjectId(req?.user?.userInfo?.userId);
      const isCorrect = annotation.ipExists === data.answer;

      if (
        isCorrect &&
        data.answer &&
        (!data.metadata || data.metadata.length === 0)
      )
        throw new HttpException(
          'Annotations are required for correct answers. Please add at least one bounding box.',
          HttpStatus.BAD_REQUEST,
        );

      if (!isCorrect && data.answer) data.answer = false;

      let userPlayCard: IPlayerCard =
        await this.playerCardService.getPlayerByUserId(
          req?.user?.userInfo?.userId,
        );

      if (!userPlayCard) {
        userPlayCard = await this.playerCardService.createPlayerCard(
          req?.user?.userInfo?.userId,
        );
      }

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
          $push: { userIds: new Types.ObjectId(req?.user?.userInfo?.userId) },
          available: annotationAnswersCount < 100,
        },
      );

      if (!updateAnnotation) {
        throw new HttpException(
          SOMETHING_WENT_WRONG_TRY_AGAIN,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!isCorrect) {
        return ResponseHelper.CreateResponse(
          {
            isCorrect: false,
            swipeAnswer: newSwipeAnswer,
            card: userPlayCard,
          },
          HttpStatus.OK,
          `Answer submitted, but no metadata needed since it is incorrect.`,
        );
      }

      userPlayCard = await this.playerCardService.updateCardByUserId(
        userMongoId,
        {
          totalPoints: userPlayCard.totalPoints + 500,
          swipePoints: userPlayCard.swipePoints + 500,
          xp: userPlayCard.xp + 10,
        },
      );

      if (!newSwipeAnswer) {
        throw new HttpException(
          'Failed to submit answer',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return ResponseHelper.CreateResponse(
        {
          isCorrect,
          swipeAnswer: newSwipeAnswer,
          card: userPlayCard,
        },
        HttpStatus.OK,
        'Answer submitted successfully.',
      );
    });
  }
}
