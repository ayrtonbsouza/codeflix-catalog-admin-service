import {
  CategoryOutputMapper,
  type CategoryOutput,
} from '@/category/application/use-cases/common/category-output';
import { Category } from '@/category/domain/entities/category.entity';
import type { ICategoryRepository } from '@/category/domain/repositories/category.repository';
import type { IUseCase } from '@/shared/application/use-cases/use-case.interface';
import { EntityValidationError } from '@/shared/domain/validators/validation.error';
import type { CreateCategoryInput } from '@/category/application/use-cases/create-category/create-category.input';

export class CreateCategoryUseCase
  implements IUseCase<CreateCategoryInput, CreateCategoryOutput>
{
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(input: CreateCategoryInput): Promise<CreateCategoryOutput> {
    const category = Category.create(input);
    if (category.notification.hasErrors()) {
      throw new EntityValidationError(category.notification.toJSON());
    }
    await this.categoryRepository.insert(category);
    return CategoryOutputMapper.toOutput(category);
  }
}

export type CreateCategoryOutput = CategoryOutput;
