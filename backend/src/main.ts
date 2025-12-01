import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Initiate Swagger / OpenAPI
  const config = new DocumentBuilder()
    .setTitle('HypeIt API')
    .setDescription('API Documentation for HypeIt')
    .setVersion('1.0')
    .addTag('hypeit')
    .build();

  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, doc);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: '*', // Atau spesifik 'http://localhost:5173'
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });
  app.use(helmet());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
