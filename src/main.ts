// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:3000',                 // local dev
      'https://investingarrowbot.com',         // your frontend
      'https://api.investingarrowbot.com'      // your new backend domain
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });  

  await app.listen(process.env.PORT || 3001);
}
bootstrap();
