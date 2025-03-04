import { Injectable } from '@nestjs/common';
import { Image, ImageDocument } from './schema/image.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateImageDto } from './dto/image.dto';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { OciStorageService } from 'src/oci-storage/oci-storage.service';
import axios from 'axios';
import { EnvVariables } from 'src/utils/env';

@Injectable()
export class ImageService {
  private openai: OpenAI;

  constructor(
    @InjectModel(Image.name)
    private readonly imageModel: Model<ImageDocument>,
    private readonly ociStorageService: OciStorageService,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async create(imageData: CreateImageDto, imageUrl: string): Promise<any> {
    return this.imageModel.create({ ...imageData, imageUrl });
  }

  // async generateImage(prompt: string): Promise<string> {
  //   console.log('Generating Image with OpenAI for Prompt:', prompt);
  //   const openAiResponse = await this.openai.images.generate({
  //     model: 'dall-e-4',
  //     prompt,
  //     n: 1,
  //     size: '1024x1024',
  //   });

  //   if (!openAiResponse.data || !openAiResponse.data[0]?.url) {
  //     throw new Error('OpenAI Image API did not return a valid response.');
  //   }

  //   const imageUrl = openAiResponse.data[0].url;
  //   console.log('Generated Image URL:', imageUrl);

  //   // Now download the image as a buffer before uploading
  //   const response = await fetch(imageUrl);
  //   const arrayBuffer = await response.arrayBuffer();
  //   const imageBuffer = Buffer.from(arrayBuffer);

  //   // Create a unique filename for the image
  //   const fileName = `${uuidv4()}.png`;

  //   // Create a mock file-like object for the upload
  //   const file = {
  //     buffer: imageBuffer,
  //     mimetype: 'image/png',
  //   } as Express.Multer.File;

  //   // Ensure upload happens **only after** image is downloaded
  //   console.log('Uploading image to OCI Storage...');
  //   const uploadedImageUrl = await this.ociStorageService.upload(
  //     fileName,
  //     file,
  //   );
  //   console.log('Successfully uploaded to OCI:', uploadedImageUrl);

  //   return uploadedImageUrl;
  // }

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

    if (!EnvVariables.huggingfaceApiKey) {
      throw new Error('Missing Hugging Face API key.');
    }

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

      if (!response.data) {
        throw new Error(
          `Hugging Face API did not return a valid image for model ${model}.`,
        );
      }

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
