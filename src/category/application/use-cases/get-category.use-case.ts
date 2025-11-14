import { Category } from '@/category/domain/entities/category.entity';
import type { ICategoryRepository } from '@/category/domain/repositories/category.repository';
import type { IUseCase } from '@/shared/application/use-cases/use-case.interface';
import { NotFoundError } from '@/shared/domain/errors/not-found.error';
import { Uuid } from '@/shared/domain/value-objects/uuid.vo';

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

    return {
      id: category.id.value,
      name: category.name,
      description: category.description,
      is_active: category.is_active,
      created_at: category.created_at,
    };
  }
}

export type GetCategoryInput = {
  id: string;
};

export type GetCategoryOutput = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: Date;
};
