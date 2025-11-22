import type { ListCategoriesInput } from '@core/category/application/use-cases/list-category/list-categories.use-case';
import type { SortDirection } from '@core/shared/domain/repositories/search-params';

export class SearchCategoryDto implements ListCategoriesInput {
  page?: number;
  per_page?: number;
  sort?: string;
  sort_dir?: SortDirection;
  filter?: string;
}
