import { Module } from '@nestjs/common';
import { AnnotationsService } from './annotations.service';
import { AnnotationsController } from './annotations.controller';

@Module({
  providers: [AnnotationsService],
  controllers: [AnnotationsController]
})
export class AnnotationsModule {}
