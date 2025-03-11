import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { OciStorageService } from 'src/oci-storage/oci-storage.service';
import axios from 'axios';
import { EnvVariables } from 'src/utils/env';

@Injectable()
export class ImageService {
  private openai: OpenAI;

  constructor(private readonly ociStorageService: OciStorageService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // 🔹 Function 1: Generates an image using Stable Diffusion v2
  async generateImage(prompt: string): Promise<string> {
    return this.generateImageWithModel(
      prompt,
      'stabilityai/stable-diffusion-2',
    );
  }

  // 🔹 Function 2: Generates an image using Stable Diffusion XL for higher quality
  async generateImageXL(prompt: string): Promise<string> {
    return this.generateImageWithModel(
      prompt,
      'stabilityai/stable-diffusion-xl-base-1.0',
    );
  }

  // 🔹 Function 3: Generates an image with extra control settings (e.g., LoRA, ControlNet)
  async generateImageControlled(
    prompt: string,
    controlParams: any,
  ): Promise<string> {
    return this.generateImageWithModel(
      prompt,
      'stabilityai/stable-diffusion-xl-base-1.0',
      controlParams,
    );
  }

  private async generateImageWithModel(
    prompt: string,
    model: string,
    additionalParams = {},
  ): Promise<string> {
    console.log(`Generating Image with ${model} for Prompt:`, prompt);

    if (!EnvVariables.huggingfaceApiKey)
      throw new Error('Missing Hugging Face API key.');

    try {
      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          inputs: prompt,
          parameters: {
            height: 1024,
            width: 1024,
            guidance_scale: 7.5,
            num_inference_steps: 50,
            ...additionalParams, // Additional parameters for control
          },
        },
        {
          headers: {
            Authorization: `Bearer ${EnvVariables.huggingfaceApiKey}`,
          },
          responseType: 'arraybuffer',
        },
      );

      if (!response.data)
        throw new Error(
          `Hugging Face API did not return a valid image for model ${model}.`,
        );

      console.log(`Generated image using ${model} for prompt: ${prompt}`);

      const imageBuffer = Buffer.from(response.data, 'binary');
      const fileName = `${Date.now()}_generated.png`;
      const file = {
        buffer: imageBuffer,
        mimetype: 'image/png',
      } as Express.Multer.File;

      console.log('Uploading image to OCI Storage...');
      const uploadedImageUrl = await this.ociStorageService.upload(
        fileName,
        file,
      );
      console.log('Successfully uploaded to OCI:', uploadedImageUrl);

      return uploadedImageUrl;
    } catch (error) {
      console.error(`Error generating image with ${model}:`, error.message);
      throw new Error(`Failed to generate image using ${model}.`);
    }
  }

  async generateImageWithOpenAI(prompt: string): Promise<string> {
    console.log('Generating Image with DALL·E 3 for Prompt:', prompt);

    if (!process.env.OPENAI_API_KEY) {
      throw new Error('Missing OpenAI API key in environment variables.');
    }

    try {
      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt,
        n: 1, // Generate only one image
        size: '1024x1024', // Image size
      });

      if (
        !response.data ||
        response.data.length === 0 ||
        !response.data[0].url
      ) {
        throw new Error('OpenAI API did not return a valid image.');
      }

      console.log(`Generated image using DALL·E 3 for prompt: ${prompt}`);

      // Download image from OpenAI URL
      const imageResponse = await axios.get(response.data[0].url, {
        responseType: 'arraybuffer',
      });

      // Convert response to buffer
      const imageBuffer = Buffer.from(imageResponse.data, 'binary');
      const fileName = `${Date.now()}_generated.png`;
      const file = {
        buffer: imageBuffer,
        mimetype: 'image/png',
      } as Express.Multer.File;

      console.log('Uploading image to OCI Storage...');
      const uploadedImageUrl = await this.ociStorageService.upload(
        fileName,
        file,
      );
      console.log('Successfully uploaded to OCI:', uploadedImageUrl);

      return uploadedImageUrl;
    } catch (error) {
      console.error('Error generating image with DALL·E 4:', error.message);
      throw new Error('Failed to generate image using DALL·E 4.');
    }
  }

  private createFileObject(imageBuffer: Buffer): Express.Multer.File {
    return {
      fieldname: 'image',
      originalname: `${uuidv4()}.png`,
      encoding: '7bit',
      mimetype: 'image/png',
      buffer: imageBuffer,
      size: imageBuffer.length,
    } as Express.Multer.File;
  }
}
