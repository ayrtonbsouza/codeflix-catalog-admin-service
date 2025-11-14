import { Category } from '@/category/domain/entities/category.entity';
import type { ICategoryRepository } from '@/category/domain/repositories/category.repository';
import type { IUseCase } from '@/shared/application/use-cases/use-case.interface';
import { NotFoundError } from '@/shared/domain/errors/not-found.error';
import { Uuid } from '@/shared/domain/value-objects/uuid.vo';

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

    await this.categoryRepository.update(category);

    return {
      id: category.id.value,
      name: category.name,
      description: category.description,
      is_active: category.is_active,
      created_at: category.created_at,
    };
  }
}

export type UpdateCategoryInput = {
  id: string;
  name?: string;
  description?: string;
  is_active?: boolean;
};

export type UpdateCategoryOutput = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: Date;
};
