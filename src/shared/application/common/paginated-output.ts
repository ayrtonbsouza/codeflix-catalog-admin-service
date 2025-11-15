import type { SearchResult } from '@/shared/domain/repositories/search-result';

export type PaginatedOutput<Item = any> = {
  items: Item[];
  total: number;
  current_page: number;
  per_page: number;
  last_page: number;
};

export class PaginatedOutputMapper {
  static toOutput<Item = any>(
    items: Item[],
    props: Omit<SearchResult, 'items'>,
  ): PaginatedOutput<Item> {
    return {
      items,
      total: props.total,
      current_page: props.current_page,
      per_page: props.per_page,
      last_page: props.last_page,
    };
  }
}
