import { Category } from '@/category/domain/entities/category.entity';
import type { Uuid } from '@/shared/domain/value-objects/uuid.vo';
import { InMemoryRepository } from '@/shared/infra/db/in-memory/in-memory.repository';

export class CategoryInMemoryRepository extends InMemoryRepository<
  Category,
  Uuid
> {
  getEntity(): new (...args: any[]) => Category {
    return Category;
  }
}
