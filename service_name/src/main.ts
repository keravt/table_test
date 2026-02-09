import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice(
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_ADDRESS],
        queue: process.env.RABBITMQ_SERVICE_QUEUE,
        queueOptions: {
          durable: false,
        },
      },
    },
    { inheritAppConfig: true }
  );

  const config = new DocumentBuilder()
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .setTitle('Заголовок')
    .setDescription('Описание документации')
    .setVersion('1.0')
    .addTag('Тег')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(`${process.env.SERVICE_NAME}-swagger`, app, document);

  app.enableCors({ allowedHeaders: '*' });

  await app.startAllMicroservices();
  await app.listen(process.env.SERVER_PORT || '3000');
}

bootstrap();
