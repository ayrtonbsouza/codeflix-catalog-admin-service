import { Module } from '@nestjs/common';
import { CategoriesModule } from '@modules/categories-module/categories.module';
import { DatabaseModule } from '@modules/database-module/database.module';
import { ConfigModule } from '@modules/config-module/config.module';

@Module({
  imports: [ConfigModule.forRoot(), DatabaseModule, CategoriesModule],
})
export class AppModule {}
