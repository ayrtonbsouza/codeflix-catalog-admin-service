import { Category } from '@core/category/domain/entities/category.entity';
import type { ICategoryRepository } from '@core/category/domain/repositories/category.repository';
import type { IUseCase } from '@core/shared/application/use-cases/use-case.interface';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import {
  CategoryOutputMapper,
  type CategoryOutput,
} from '@core/category/application/use-cases/common/category-output';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import type { UpdateCategoryInput } from '@core/category/application/use-cases/update-category/update-category.input';

export class UpdateCategoryUseCase
  implements IUseCase<UpdateCategoryInput, UpdateCategoryOutput>
{
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(input: UpdateCategoryInput): Promise<UpdateCategoryOutput> {
    const uuid = new Uuid(input.id);
    const category = await this.categoryRepository.findById(uuid);

    if (!category) {
      throw new NotFoundError(input.id, Category);
    }

    if ('name' in input) {
      category.changeName(input.name);
    }

    if ('description' in input) {
      category.changeDescription(input.description);
    }

    if (input.is_active === true) {
      category.activate();
    }

    if (input.is_active === false) {
      category.deactivate();
    }

    if (category.notification.hasErrors()) {
      throw new EntityValidationError(category.notification.toJSON());
    }

    await this.categoryRepository.update(category);

    return CategoryOutputMapper.toOutput(category);
  }
}

export type UpdateCategoryOutput = CategoryOutput;
