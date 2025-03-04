import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Prompt, PromptDocument } from './schema/prompt.schema';
import { Model } from 'mongoose';
import { CreatePromptDto } from './dto/prompt.dto';
import OpenAI from 'openai';

@Injectable()
export class PromptService {
  private openai: OpenAI;

  constructor(
    @InjectModel(Prompt.name)
    private readonly promptModel: Model<PromptDocument>,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generatePrompt(promptText: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: promptText,
        },
      ],
      max_tokens: 50,
    });

    if (!response.choices || response.choices.length === 0) {
      throw new Error('OpenAI API returned an empty response.');
    }

    const prompt = response.choices[0].message?.content?.trim();
    if (!prompt) {
      throw new Error('Generated prompt is empty.');
    }

    return prompt;
  }

  async create(promptData: CreatePromptDto): Promise<any> {
    return this.promptModel.create(promptData);
  }

  async batchPrompts(
    batchSize: number,
  ): Promise<{ ipPrompts: string[]; nonIpPrompts: string[] }> {
    const ipPrompts: string[] = [];
    const nonIpPrompts: string[] = [];

    for (let i = 0; i < batchSize / 2; i++) {
      ipPrompts.push(
        await this.generatePrompt(
          `Generate a unique, creative text prompt for an AI-generated image that includes references to well-known brands, fictional characters, or copyrighted elements without explicitly naming them. Avoid using direct brand names or copyrighted material.`,
        ),
      );
      nonIpPrompts.push(
        await this.generatePrompt(
          `Generate a unique, creative text prompt for an AI-generated image that strictly avoids references to any brand, fictional character, or copyrighted elements. Focus on generic themes, nature, landscapes, abstract art, and original concepts.`,
        ),
      );
    }

    return { ipPrompts, nonIpPrompts };
  }
}
