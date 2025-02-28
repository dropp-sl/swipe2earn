import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Prompt, PromptDocument } from './schema/prompt.schema';
import { Model } from 'mongoose';
import { CreatePromptDto } from './dto/prompt.dto';

@Injectable()
export class PromptService {
  constructor(
    @InjectModel(Prompt.name)
    private readonly promptModel: Model<PromptDocument>,
  ) {}

  async create(promptData: CreatePromptDto): Promise<any> {
    return this.promptModel.create(promptData);
  }

  async generatePrompts(batchSize: number, ip: boolean): Promise<string[]> {
    const inputPrompt =
      `Generate exactly ${batchSize} unique text prompts for image generation. ` +
      (ip
        ? `Ensure these prompts contain Intellectual Property.`
        : `Ensure these prompts do not contain any Intellectual Property.`);

    // Call AI model for prompt generation (to be implemented in the controller)
    return [inputPrompt];
  }
}
