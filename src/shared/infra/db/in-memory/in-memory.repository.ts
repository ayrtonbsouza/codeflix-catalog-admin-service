import type { Entity } from '@/shared/domain/abstract/entity';
import type { ValueObject } from '@/shared/domain/abstract/value-object';
import { NotFoundError } from '@/shared/domain/errors/not-found.error';
import type {
  IRepository,
  ISearchableRepository,
} from '@/shared/domain/repositories/repository.interface';
import type {
  SearchParams,
  SortDirection,
} from '@/shared/domain/repositories/search-params';
import { SearchResult } from '@/shared/domain/repositories/search-result';

export abstract class InMemoryRepository<
  E extends Entity,
  EntityId extends ValueObject,
> implements IRepository<E, EntityId>
{
  protected entities: E[] = [];

  async findById(id: EntityId): Promise<E | null> {
    const item = this.entities.find((item) => item.entity_id.equals(id));
    return Promise.resolve(typeof item !== 'undefined' ? item : null);
  }

  async findAll(): Promise<E[]> {
    return Promise.resolve(this.entities);
  }

  abstract getEntity(): new (...args: any[]) => E;

  async insert(entity: E): Promise<void> {
    this.entities.push(entity);
    return Promise.resolve();
  }

  async bulkInsert(entities: E[]): Promise<void> {
    this.entities.push(...entities);
    return Promise.resolve();
  }

  async update(entity: E): Promise<void> {
    const foundIndex = this.entities.findIndex((item) =>
      item.entity_id.equals(entity.entity_id),
    );
    if (foundIndex === -1) {
      throw new NotFoundError(entity.entity_id, this.getEntity());
    }
    this.entities[foundIndex] = entity;
    return Promise.resolve();
  }

  async delete(id: EntityId): Promise<void> {
    const foundIndex = this.entities.findIndex((item) =>
      item.entity_id.equals(id),
    );
    if (foundIndex === -1) {
      throw new NotFoundError(id, this.getEntity());
    }
    this.entities.splice(foundIndex, 1);
    return Promise.resolve();
  }
}

export abstract class InMemorySearchableRepository<
    E extends Entity,
    EntityId extends ValueObject,
    Filter = string,
  >
  extends InMemoryRepository<E, EntityId>
  implements ISearchableRepository<E, EntityId, Filter>
{
  sortableFields: string[] = [];

  async search(props: SearchParams<Filter>): Promise<SearchResult<E>> {
    const filteredItems = await this.applyFilter(this.entities, props.filter);
    const sortedItems = await this.applySort(
      filteredItems,
      props.sort,
      props.sort_dir,
    );
    const paginatedItems = await this.applyPagination(
      sortedItems,
      props.page,
      props.per_page,
    );

    return new SearchResult({
      items: paginatedItems,
      total: filteredItems.length,
      current_page: props.page,
      per_page: props.per_page,
    });
  }

  protected abstract applyFilter(
    items: E[],
    filter: Filter | null,
  ): Promise<E[]>;

  protected applySort(
    items: E[],
    sort: string | null,
    sort_dir: SortDirection | null,
    custom_getter?: (sort: string, item: E) => unknown,
  ): Promise<E[]> {
    if (!sort || !this.sortableFields.includes(sort)) {
      return Promise.resolve(items);
    }

    return Promise.resolve(
      [...items].sort((a, b) => {
        const aValue = custom_getter
          ? custom_getter(sort, a)
          : a[sort as keyof E];
        const bValue = custom_getter
          ? custom_getter(sort, b)
          : b[sort as keyof E];

        if (aValue < bValue) {
          return sort_dir === 'asc' ? -1 : 1;
        }

        if (aValue > bValue) {
          return sort_dir === 'asc' ? 1 : -1;
        }

        return 0;
      }),
    );
  }

  protected applyPagination(
    items: E[],
    page: SearchParams['page'],
    per_page: SearchParams['per_page'],
  ): Promise<E[]> {
    const start = (page - 1) * per_page;
    const limit = start + per_page;
    return Promise.resolve(items.slice(start, limit));
  }
}
