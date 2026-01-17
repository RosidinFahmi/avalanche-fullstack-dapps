import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const FULL_NAME = 'Rosidin Fahmi Abdillah';
  const NIM = '221011402068';

  const config = new DocumentBuilder()
    .setTitle(`Simple Storage dApp API | ${FULL_NAME} (${NIM})`)
    .setDescription(`Simple Storage dApp API description. Peserta: ${FULL_NAME} (${NIM})`)
    .setVersion('1.0')
    .addTag('cats')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('documentation', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((error) => {
  console.error('Error during application bootstrap:', error);
  process.exit(1);
});
