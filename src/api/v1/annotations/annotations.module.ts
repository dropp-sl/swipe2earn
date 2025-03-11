import { Module } from '@nestjs/common';
import { AnnotationsService } from './annotations.service';
import { AnnotationsController } from './annotations.controller';
import { DatabaseModule } from 'src/database/database.module';
import { PromptService } from './prompt/prompt.service';
import { ImageService } from './image/image.service';
import { OciStorageService } from 'src/oci-storage/oci-storage.service';
import { CategoryService } from '../category/category.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    AnnotationsService,
    OciStorageService,
    PromptService,
    ImageService,
    CategoryService,
  ],
  controllers: [AnnotationsController],
})
export class AnnotationsModule {}
