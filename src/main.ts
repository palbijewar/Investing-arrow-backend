// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:3000', // Local dev
      'https://investingarrowbot.com', // Your custom domain (if used)
      'https://api.investingarrowbot.com', // Custom API domain (if mapped)
      'https://investing-arrowbot-app.vercel.app' // ✅ Actual Vercel frontend
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });  

  await app.listen(process.env.PORT || 3001);
}
bootstrap();
