import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from '@modules/categories-module/categories.controller';
import { DatabaseModule } from '@/modules/database-module/database.module';
import { CategoriesModule } from '@modules/categories-module/categories.module';
import { ConfigModule } from '@/modules/config-module/config.module';

describe('CategoriesController', () => {
  let controller: CategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), DatabaseModule, CategoriesModule],
    }).compile();
    controller = module.get<CategoriesController>(CategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
