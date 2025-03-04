import { Document, Types } from 'mongoose';

export interface IStreak {
  currentStreak: number;
  bestStreak: number;
  timeSwiping: number; // Total time spent swiping
}

export interface IPlayerCard extends Document {
  userId: Types.ObjectId;
  points: number;
  xp: number;
  level: number;
  rank: string;
  streak: number;
  bestStreak: number;
  timeSwiping: number;
  achievements: Types.ObjectId[];
  activeBonuses: Types.ObjectId[];
  lastParticipationDate?: Date;
  bonusEffects: Map<string, number>;
  createdAt: Date;
  updatedAt: Date;
}
