import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './exception/global-exception';
import * as bodyParser from 'body-parser';
// import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for both HTTP and WebSocket connections
  app.enableCors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow necessary HTTP methods
  });

  // Set global prefix for API routes
  app.setGlobalPrefix('api/v1', {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });

  // Body parser middleware
  app.use(bodyParser.json({ limit: '500mb' }));
  app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

  // Global filters and pipes
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // Swagger documentation setup
  // const config = new DocumentBuilder()
  //   .setTitle('Swipe2Earn API')
  //   .setDescription('API documentation for Swipe2Earn')
  //   .setVersion('1.0')
  //   .addBearerAuth()
  //   .build();

  // const document = SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('api/docs', app, document);

  // Start the application
  const PORT = process.env.PORT || 4800;
  await app.listen(PORT, '0.0.0.0', () =>
    console.log(`Server listening on http://localhost:${PORT}/health`),
  );
}

bootstrap();
