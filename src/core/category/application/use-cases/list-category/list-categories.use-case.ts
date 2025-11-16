import {
  CategorySearchParams,
  type CategoryFilter,
  type ICategoryRepository,
  CategorySearchResult,
} from '@core/category/domain/repositories/category.repository';
import {
  PaginatedOutputMapper,
  type PaginatedOutput,
} from '@core/shared/application/common/paginated-output';
import type { IUseCase } from '@core/shared/application/use-cases/use-case.interface';
import type { SortDirection } from '@core/shared/domain/repositories/search-params';
import {
  CategoryOutputMapper,
  type CategoryOutput,
} from '@core/category/application/use-cases/common/category-output';

export class ListCategoriesUseCase
  implements IUseCase<ListCategoriesInput, ListCategoriesOutput>
{
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(input: ListCategoriesInput): Promise<ListCategoriesOutput> {
    const params = new CategorySearchParams(input);
    const searchResult = await this.categoryRepository.search(params);
    return this.toOutput(searchResult);
  }

  private toOutput(searchResult: CategorySearchResult): ListCategoriesOutput {
    const { items: _items } = searchResult;
    const items = _items.map((item) => {
      return CategoryOutputMapper.toOutput(item);
    });
    return PaginatedOutputMapper.toOutput(items, searchResult);
  }
}

export type ListCategoriesInput = {
  page?: number;
  per_page?: number;
  sort?: string | null;
  sort_dir?: SortDirection | null;
  filter?: CategoryFilter | null;
};

export type ListCategoriesOutput = PaginatedOutput<CategoryOutput>;
