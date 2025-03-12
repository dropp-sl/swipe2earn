import { Injectable } from '@nestjs/common';
import { PlayerCard, PlayerCardDocument } from '../schema/player-card.schema';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';
import { AchievementsService } from '../../achievement/achievement.service';
import { IAchievement } from '../../achievement/interface/achievement.interface';

@Injectable()
export class PlayerCardService {
  constructor(
    @InjectModel(PlayerCard.name)
    private playerCardModel: Model<PlayerCard>,
    private achievementsService: AchievementsService,
  ) {}

  async getPlayerCard(userId: string): Promise<any> {
    return this.playerCardModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .populate('achievements')
      .exec();
  }

  async getPlayerByUserId(userId: string): Promise<any> {
    return this.playerCardModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .exec();
  }

  async createPlayerCard(userId: string): Promise<any> {
    return this.playerCardModel.create({
      userId: new Types.ObjectId(userId),
    });
  }

  async updateCardById(
    filter: FilterQuery<any>,
    data: UpdateQuery<any>,
  ): Promise<any> {
    return await this.playerCardModel
      .updateOne(filter, data, { new: true })
      .exec();
  }

  async addUserPoints(userId: string, pointsEarned: number): Promise<any> {
    let card = await this.playerCardModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .exec();

    if (!card) {
      card = await this.playerCardModel.create({
        userId: new Types.ObjectId(userId),
      });
    }

    card.totalPoints += pointsEarned;
    card.swipePoints += pointsEarned;
    card.xp += this.calculateXp(pointsEarned);
    this.handleLevelUpdate(card);
    this.updateDailyStreak(card);

    await card.save();
    return card;
  }

  private calculateXp(points: number): number {
    // Convert points to XP (allows flexibility in XP formula)
    // For simplicity, 1 point = 1 XP here, but this could scale or vary.
    return points;
  }

  private handleLevelUpdate(card: PlayerCardDocument): void {
    // Example using predefined XP thresholds for each level
    const nextLevel = card.level + 1;
    const requiredXp = LEVEL_XP_THRESHOLDS[nextLevel];
    if (requiredXp && card.xp >= requiredXp) {
      card.level = nextLevel;
      // Optionally update rank based on new level or total points
      this.updateRank(card);
    }
    // (If a user can jump multiple levels if they earn a lot of XP at once,
    // you might loop this check until card.xp is below the next threshold.)
  }

  private updateRank(card: PlayerCardDocument): void {
    // Example: derive rank title from level or points
    if (card.level >= 10) {
      card.rank = 'Expert';
    } else if (card.level >= 5) {
      card.rank = 'Intermediate';
    } else {
      card.rank = 'Novice';
    }
    // (Rank criteria can be adjusted or could be based on percentile/leaderboard instead.)
  }

  private updateDailyStreak(card: PlayerCardDocument): void {
    const today = new Date();
    const lastDate = card.lastParticipationDate;
    if (lastDate) {
      // Calculate difference in days between last participation and today
      const diffDays = this.daysBetween(lastDate, today);
      if (diffDays === 1) {
        // Consecutive day
        card.streak += 1;
      } else if (diffDays > 1) {
        // Missed at least one day -> streak resets
        card.streak = 1;
      }
      // If diffDays == 0 (already did something today), we usually do not increment streak again.
    } else {
      // No last date means this is the first activity
      card.streak = 1;
    }
    card.lastParticipationDate = today;

    // Check for streak-based bonuses or achievements
    if (card.streak === 10) {
      // Example: award an achievement for a 10-day streak
      this.awardAchievement(card, '10-Day Streak');
    }
  }

  private daysBetween(date1: Date, date2: Date): number {
    // Compute full-day difference between two dates
    const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    const diffTime = d2.getTime() - d1.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  private async awardAchievement(
    card: PlayerCardDocument,
    achievementName: string,
  ): Promise<void> {
    const achievement: IAchievement =
      await this.achievementsService.findByName(achievementName);
    if (achievement && !card.achievements.includes(achievement._id)) {
      card.achievements.push(achievement._id);
      // You might notify the user about the new achievement here as well.
    }
  }
}
