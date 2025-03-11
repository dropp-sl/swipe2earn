import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { CategoryService } from '../../category/category.service';
import { ICategory } from '../../category/interface/category.interface';

@Injectable()
export class PromptService {
  private openai: OpenAI;

  constructor(private readonly categoryService: CategoryService) {
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

  async batchPrompts(
    batchSize: number,
  ): Promise<{ ipPrompts: string[]; nonIpPrompts: string[] }> {
    const ipPrompts: string[] = [];
    const nonIpPrompts: string[] = [];
    const categories: ICategory[] =
      await this.categoryService.getAllCategories();

    if (!categories || categories.length === 0) {
      throw new Error('No categories available for prompt generation.');
    }

    let categoryIndex = 0;

    for (let i = 0; i < batchSize / 2; i++) {
      const category = categories[categoryIndex];

      ipPrompts.push(
        await this.generatePrompt(
          `Generate a unique, creative but logic text prompt in one sentence for an AI-generated image related to the category "${category.name}". 
        This image should include elements inspired by well-known brands, fictional characters, or copyrighted concepts. Explicitly mention the category at least once.`,
        ),
      );

      nonIpPrompts.push(
        await this.generatePrompt(
          `Generate a unique, creative but logic text prompt in one sentence for an AI-generated image related to the category "${category.name}". 
        This image should **strictly** avoid references to any brand, fictional character, or copyrighted elements. 
        Focus on generic themes, nature, landscapes, abstract art, and original designs. Explicitly mention the category at least once.`,
        ),
      );

      // Move to the next category in a round-robin manner
      categoryIndex = (categoryIndex + 1) % categories.length;
    }

    return { ipPrompts, nonIpPrompts };
  }
}
