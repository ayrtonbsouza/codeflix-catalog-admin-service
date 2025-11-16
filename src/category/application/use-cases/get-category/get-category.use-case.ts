import { Category } from '@/category/domain/entities/category.entity';
import type { ICategoryRepository } from '@/category/domain/repositories/category.repository';
import type { IUseCase } from '@/shared/application/use-cases/use-case.interface';
import { NotFoundError } from '@/shared/domain/errors/not-found.error';
import { Uuid } from '@/shared/domain/value-objects/uuid.vo';
import {
  CategoryOutputMapper,
  type CategoryOutput,
} from '@/category/application/use-cases/common/category-output';

export class GetCategoryUseCase
  implements IUseCase<GetCategoryInput, GetCategoryOutput>
{
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(input: GetCategoryInput): Promise<GetCategoryOutput> {
    const uuid = new Uuid(input.id);
    const category = await this.categoryRepository.findById(uuid);

    if (!category) {
      throw new NotFoundError(input.id, Category);
    }

    return CategoryOutputMapper.toOutput(category);
  }
}

export type GetCategoryInput = {
  id: string;
};

export type GetCategoryOutput = CategoryOutput;
