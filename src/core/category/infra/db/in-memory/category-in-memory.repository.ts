import { Category } from '@core/category/domain/entities/category.entity';
import type {
  CategoryFilter,
  ICategoryRepository,
} from '@core/category/domain/repositories/category.repository';
import type { SortDirection } from '@core/shared/domain/repositories/search-params';
import type { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { InMemorySearchableRepository } from '@core/shared/infra/db/in-memory/in-memory.repository';

export class CategoryInMemoryRepository
  extends InMemorySearchableRepository<Category, Uuid>
  implements ICategoryRepository
{
  sortableFields: string[] = ['name', 'created_at'];

  protected async applyFilter(
    items: Category[],
    filter: CategoryFilter,
  ): Promise<Category[]> {
    if (!filter) {
      return Promise.resolve(items);
    }

    return items.filter((item) => {
      return item.name.toLowerCase().includes(filter.toLowerCase());
    });
  }

  protected async applySort(
    items: Category[],
    sort: string | null,
    sort_dir: SortDirection,
  ): Promise<Category[]> {
    return sort
      ? super.applySort(items, sort, sort_dir)
      : super.applySort(items, 'created_at', 'desc');
  }

  getEntity(): new (...args: any[]) => Category {
    return Category;
  }
}
