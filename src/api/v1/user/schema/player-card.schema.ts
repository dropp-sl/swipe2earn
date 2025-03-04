import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PlayerCardDocument = PlayerCard & Document;

@Schema()
export class PlayerCard {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    unique: true,
    index: true,
    required: true,
  })
  userId: Types.ObjectId;

  @Prop({ default: 0 })
  points: number;

  @Prop({ default: 0 })
  xp: number;

  @Prop({ default: 1 })
  level: number;

  @Prop({ default: 'DGN Rookie' })
  rank: string;

  @Prop({ default: 0 })
  streak: number;

  @Prop({ default: 0 })
  bestStreak: number; // Highest streak achieved

  @Prop({ default: 0 })
  timeSwiping: number; // Tracks total time spent swiping (in seconds or minutes)

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Achievement' }], default: [] })
  achievements: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Bonus' }], default: [] })
  activeBonuses: Types.ObjectId[]; // List of currently active bonuses

  @Prop()
  lastParticipationDate?: Date;

  @Prop({ type: Map, of: Number, default: {} })
  bonusEffects: Map<string, number>; // Stores active bonus effects (e.g., double points remaining)
}

export const PlayerCardSchema = SchemaFactory.createForClass(PlayerCard);
