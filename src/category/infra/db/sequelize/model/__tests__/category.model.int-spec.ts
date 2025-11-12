import { Sequelize } from 'sequelize-typescript';
import { CategoryModel } from '../category.model';
import { Category } from '@/category/domain/entities/category.entity';

describe('Integration: [Category Model]', () => {
  test('should create a category', async () => {
    const sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      models: [CategoryModel],
      logging: false,
    });

    await sequelize.sync({ force: true });

    const category = Category.fake().createCategory().build();

    await CategoryModel.create({
      id: category.id.value,
      name: category.name,
      description: category.description,
      is_active: category.is_active,
      created_at: category.created_at,
    });
  });
});
