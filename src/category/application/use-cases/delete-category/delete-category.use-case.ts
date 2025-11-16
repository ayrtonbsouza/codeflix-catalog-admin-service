import type { IUseCase } from '@/shared/application/use-cases/use-case.interface';
import type { ICategoryRepository } from '@/category/domain/repositories/category.repository';
import { Uuid } from '@/shared/domain/value-objects/uuid.vo';

export class DeleteCategoryUseCase
  implements IUseCase<DeleteCategoryInput, DeleteCategoryOutput>
{
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(input: DeleteCategoryInput): Promise<DeleteCategoryOutput> {
    const uuid = new Uuid(input.id);
    await this.categoryRepository.delete(uuid);
  }
}

export type DeleteCategoryInput = {
  id: string;
};

export type DeleteCategoryOutput = void;
