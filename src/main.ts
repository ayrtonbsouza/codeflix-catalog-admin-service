import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from '@/app.module';
import {
  ClassSerializerInterceptor,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { DataWrapperInterceptor } from '@modules/shared-module/interceptors/data-wrapper/data-wrapper.interceptor';
import { NotFoundFilter } from '@modules/shared-module/filters/not-found/not-found.filter';
import { EntityValidationFilter } from '@modules/shared-module/filters/entity-validation/entity-validation.filter';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalInterceptors(new DataWrapperInterceptor());
  app.useGlobalFilters(new NotFoundFilter(), new EntityValidationFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
