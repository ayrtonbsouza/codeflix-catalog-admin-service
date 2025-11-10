jest.mock('uuid', () => ({
  v4: () => '550e8400-e29b-41d4-a716-446655440000',
  validate: () => true,
}));

import {
  InMemoryRepository,
  InMemorySearchableRepository,
} from '@/shared/infra/db/in-memory/in-memory.repository';
import { Entity } from '@/shared/domain/abstract/entity';
import type { ValueObject } from '@/shared/domain/abstract/value-object';
import { Uuid } from '@/shared/domain/value-objects/uuid.vo';
import { NotFoundError } from '@/shared/domain/errors/not-found.error';
import { SearchParams } from '@/shared/domain/repositories/search-params';
import { SearchResult } from '@/shared/domain/repositories/search-result';

class TestEntity extends Entity {
  id: Uuid;
  name: string;

  constructor(props: { id?: Uuid; name: string }) {
    super();
    this.id = props.id ?? new Uuid();
    this.name = props.name;
  }

  get entity_id(): ValueObject {
    return this.id;
  }

  toJSON() {
    return {
      id: this.id.value,
      name: this.name,
    };
  }
}

class TestEntityWithPrice extends Entity {
  id: Uuid;
  name: string;
  price: number;

  constructor(props: { id?: Uuid; name: string; price: number }) {
    super();
    this.id = props.id ?? new Uuid();
    this.name = props.name;
    this.price = props.price;
  }

  get entity_id(): ValueObject {
    return this.id;
  }

  toJSON() {
    return {
      id: this.id.value,
      name: this.name,
      price: this.price,
    };
  }
}

class TestInMemoryRepository extends InMemoryRepository<TestEntity, Uuid> {
  getEntity(): new (...args: any[]) => TestEntity {
    return TestEntity;
  }
}

class TestInMemorySearchableRepository extends InMemorySearchableRepository<
  TestEntityWithPrice,
  Uuid,
  string
> {
  sortableFields: string[] = ['name', 'price'];

  getEntity(): new (...args: any[]) => TestEntityWithPrice {
    return TestEntityWithPrice;
  }

  protected async applyFilter(
    items: TestEntityWithPrice[],
    filter: string | null,
  ): Promise<TestEntityWithPrice[]> {
    if (!filter) {
      return Promise.resolve(items);
    }

    return Promise.resolve(
      items.filter((item) =>
        item.name.toLowerCase().includes(filter.toLowerCase()),
      ),
    );
  }
}

describe('[InMemoryRepository]', () => {
  let repository: TestInMemoryRepository;

  beforeEach(() => {
    repository = new TestInMemoryRepository();
  });

  describe('[findById]', () => {
    it('should return null when entity does not exist', async () => {
      // Arrange
      const id = new Uuid();

      // Act
      const result = await repository.findById(id);

      // Assert
      expect(result).toBeNull();
    });

    it('should return the entity when it exists', async () => {
      // Arrange
      const entity = new TestEntity({ name: 'Test' });
      await repository.insert(entity);

      // Act
      const result = await repository.findById(entity.id);

      // Assert
      expect(result).toBeInstanceOf(TestEntity);
      expect(result?.toJSON()).toEqual(entity.toJSON());
    });
  });

  describe('[findAll]', () => {
    it('should return an empty list initially', async () => {
      // Arrange & Act
      const result = await repository.findAll();

      // Assert
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    it('should return all entities after insertions', async () => {
      // Arrange
      const entities = [
        new TestEntity({ name: 'A' }),
        new TestEntity({ name: 'B' }),
      ];
      await repository.bulkInsert(entities);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(result).toHaveLength(2);
      expect(result.map((e) => e.toJSON())).toEqual(
        entities.map((e) => e.toJSON()),
      );
    });
  });

  describe('[insert]', () => {
    it('should insert an entity', async () => {
      // Arrange
      const entity = new TestEntity({ name: 'New' });

      // Act
      await repository.insert(entity);

      // Assert
      const all = await repository.findAll();
      expect(all).toHaveLength(1);
      expect(all[0].toJSON()).toEqual(entity.toJSON());
    });
  });

  describe('[bulkInsert]', () => {
    it('should insert multiple entities', async () => {
      // Arrange
      const entities = [
        new TestEntity({ name: 'E1' }),
        new TestEntity({ name: 'E2' }),
        new TestEntity({ name: 'E3' }),
      ];

      // Act
      await repository.bulkInsert(entities);

      // Assert
      const all = await repository.findAll();
      expect(all).toHaveLength(3);
      expect(all.map((e) => e.toJSON())).toEqual(
        entities.map((e) => e.toJSON()),
      );
    });
  });

  describe('[update]', () => {
    it('should throw NotFoundError when entity does not exist', async () => {
      // Arrange
      const entity = new TestEntity({ name: 'Non-existent' });

      // Act & Assert
      await expect(repository.update(entity)).rejects.toBeInstanceOf(
        NotFoundError,
      );
      await expect(repository.update(entity)).rejects.toThrow(
        `${TestEntity.name} not found with id ${entity.id.value}`,
      );
    });

    it('should update existing entity', async () => {
      // Arrange
      const entity = new TestEntity({ name: 'Before' });
      await repository.insert(entity);
      const updated = new TestEntity({ id: entity.id, name: 'After' });

      // Act
      await repository.update(updated);

      // Assert
      const found = await repository.findById(entity.id);
      expect(found?.name).toBe('After');
      expect(found?.toJSON()).toEqual(updated.toJSON());
    });
  });

  describe('[delete]', () => {
    it('should throw NotFoundError when id does not exist', async () => {
      // Arrange
      const id = new Uuid();

      // Act & Assert
      await expect(repository.delete(id)).rejects.toBeInstanceOf(NotFoundError);
      await expect(repository.delete(id)).rejects.toThrow(
        `${TestEntity.name} not found with id ${id.value}`,
      );
    });

    it('should remove existing entity', async () => {
      // Arrange
      const entity = new TestEntity({ name: 'Remove' });
      await repository.insert(entity);

      // Act
      await repository.delete(entity.id);

      // Assert
      const all = await repository.findAll();
      expect(all).toHaveLength(0);
      const found = await repository.findById(entity.id);
      expect(found).toBeNull();
    });
  });
});

describe('[InMemorySearchableRepository]', () => {
  let repository: TestInMemorySearchableRepository;

  beforeEach(() => {
    repository = new TestInMemorySearchableRepository();
  });

  describe('[search]', () => {
    it('should return empty SearchResult when there are no entities', async () => {
      // Arrange
      const searchParams = new SearchParams();

      // Act
      const result = await repository.search(searchParams);

      // Assert
      expect(result).toBeInstanceOf(SearchResult);
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.current_page).toBe(1);
      expect(result.per_page).toBe(15);
      expect(result.last_page).toBe(0);
    });

    it('should return all entities when there is no filter', async () => {
      // Arrange
      const entities = [
        new TestEntityWithPrice({ name: 'Entity A', price: 100 }),
        new TestEntityWithPrice({ name: 'Entity B', price: 200 }),
        new TestEntityWithPrice({ name: 'Entity C', price: 300 }),
      ];
      await repository.bulkInsert(entities);
      const searchParams = new SearchParams();

      // Act
      const result = await repository.search(searchParams);

      // Assert
      expect(result.items).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result.current_page).toBe(1);
      expect(result.per_page).toBe(15);
    });

    it('should filter entities correctly', async () => {
      // Arrange
      const entities = [
        new TestEntityWithPrice({ name: 'Apple', price: 100 }),
        new TestEntityWithPrice({ name: 'Banana', price: 200 }),
        new TestEntityWithPrice({ name: 'Apple Pie', price: 300 }),
      ];
      await repository.bulkInsert(entities);
      const searchParams = new SearchParams({ filter: 'apple' });

      // Act
      const result = await repository.search(searchParams);

      // Assert
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(
        result.items.every((item) => item.name.toLowerCase().includes('apple')),
      ).toBe(true);
    });

    it('should return empty list when filter finds nothing', async () => {
      // Arrange
      const entities = [
        new TestEntityWithPrice({ name: 'Apple', price: 100 }),
        new TestEntityWithPrice({ name: 'Banana', price: 200 }),
      ];
      await repository.bulkInsert(entities);
      const searchParams = new SearchParams({ filter: 'Orange' });

      // Act
      const result = await repository.search(searchParams);

      // Assert
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should sort entities by valid field in ascending order', async () => {
      // Arrange
      const entities = [
        new TestEntityWithPrice({ name: 'Zebra', price: 100 }),
        new TestEntityWithPrice({ name: 'Apple', price: 200 }),
        new TestEntityWithPrice({ name: 'Banana', price: 300 }),
      ];
      await repository.bulkInsert(entities);
      const searchParams = new SearchParams({
        sort: 'name',
        sort_dir: 'asc',
      });

      // Act
      const result = await repository.search(searchParams);

      // Assert
      expect(result.items).toHaveLength(3);
      expect(result.items[0].name).toBe('Apple');
      expect(result.items[1].name).toBe('Banana');
      expect(result.items[2].name).toBe('Zebra');
    });

    it('should sort entities by valid field in descending order', async () => {
      // Arrange
      const entities = [
        new TestEntityWithPrice({ name: 'Apple', price: 100 }),
        new TestEntityWithPrice({ name: 'Banana', price: 200 }),
        new TestEntityWithPrice({ name: 'Zebra', price: 300 }),
      ];
      await repository.bulkInsert(entities);
      const searchParams = new SearchParams({
        sort: 'name',
        sort_dir: 'desc',
      });

      // Act
      const result = await repository.search(searchParams);

      // Assert
      expect(result.items).toHaveLength(3);
      expect(result.items[0].name).toBe('Zebra');
      expect(result.items[1].name).toBe('Banana');
      expect(result.items[2].name).toBe('Apple');
    });

    it('should sort by number correctly', async () => {
      // Arrange
      const entities = [
        new TestEntityWithPrice({ name: 'A', price: 300 }),
        new TestEntityWithPrice({ name: 'B', price: 100 }),
        new TestEntityWithPrice({ name: 'C', price: 200 }),
      ];
      await repository.bulkInsert(entities);
      const searchParams = new SearchParams({
        sort: 'price',
        sort_dir: 'asc',
      });

      // Act
      const result = await repository.search(searchParams);

      // Assert
      expect(result.items).toHaveLength(3);
      expect(result.items[0].price).toBe(100);
      expect(result.items[1].price).toBe(200);
      expect(result.items[2].price).toBe(300);
    });

    it('should not sort when field is not in sortableFields', async () => {
      // Arrange
      const entities = [
        new TestEntityWithPrice({ name: 'Zebra', price: 100 }),
        new TestEntityWithPrice({ name: 'Apple', price: 200 }),
        new TestEntityWithPrice({ name: 'Banana', price: 300 }),
      ];
      await repository.bulkInsert(entities);
      const searchParams = new SearchParams({
        sort: 'invalid_field',
        sort_dir: 'asc',
      });

      // Act
      const result = await repository.search(searchParams);

      // Assert
      expect(result.items).toHaveLength(3);
      // Order should be the same as insertion (not sorted)
      expect(result.items[0].name).toBe('Zebra');
      expect(result.items[1].name).toBe('Apple');
      expect(result.items[2].name).toBe('Banana');
    });

    it('should not sort when sort is null', async () => {
      // Arrange
      const entities = [
        new TestEntityWithPrice({ name: 'Zebra', price: 100 }),
        new TestEntityWithPrice({ name: 'Apple', price: 200 }),
      ];
      await repository.bulkInsert(entities);
      const searchParams = new SearchParams({
        sort: null,
        sort_dir: 'asc',
      });

      // Act
      const result = await repository.search(searchParams);

      // Assert
      expect(result.items).toHaveLength(2);
      // Order should be the same as insertion
      expect(result.items[0].name).toBe('Zebra');
      expect(result.items[1].name).toBe('Apple');
    });

    it('should paginate results correctly', async () => {
      // Arrange
      const entities = Array.from(
        { length: 25 },
        (_, i) =>
          new TestEntityWithPrice({
            name: `Entity ${i + 1}`,
            price: (i + 1) * 10,
          }),
      );
      await repository.bulkInsert(entities);
      const searchParams = new SearchParams({
        page: 2,
        per_page: 10,
      });

      // Act
      const result = await repository.search(searchParams);

      // Assert
      expect(result.items).toHaveLength(10);
      expect(result.total).toBe(25);
      expect(result.current_page).toBe(2);
      expect(result.per_page).toBe(10);
      expect(result.last_page).toBe(3);
      expect(result.items[0].name).toBe('Entity 11');
      expect(result.items[9].name).toBe('Entity 20');
    });

    it('should return empty page when page does not exist', async () => {
      // Arrange
      const entities = Array.from(
        { length: 10 },
        (_, i) =>
          new TestEntityWithPrice({
            name: `Entity ${i + 1}`,
            price: (i + 1) * 10,
          }),
      );
      await repository.bulkInsert(entities);
      const searchParams = new SearchParams({
        page: 5,
        per_page: 10,
      });

      // Act
      const result = await repository.search(searchParams);

      // Assert
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(10);
      expect(result.current_page).toBe(5);
      expect(result.per_page).toBe(10);
      expect(result.last_page).toBe(1);
    });

    it('should combine filter, sorting and pagination', async () => {
      // Arrange
      const entities = [
        new TestEntityWithPrice({ name: 'Apple Red', price: 100 }),
        new TestEntityWithPrice({ name: 'Apple Green', price: 200 }),
        new TestEntityWithPrice({ name: 'Banana Yellow', price: 150 }),
        new TestEntityWithPrice({ name: 'Apple Yellow', price: 300 }),
        new TestEntityWithPrice({ name: 'Orange', price: 250 }),
      ];
      await repository.bulkInsert(entities);
      const searchParams = new SearchParams({
        filter: 'apple',
        sort: 'price',
        sort_dir: 'asc',
        page: 1,
        per_page: 2,
      });

      // Act
      const result = await repository.search(searchParams);

      // Assert
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(3); // Total of "Apple"
      expect(result.current_page).toBe(1);
      expect(result.per_page).toBe(2);
      expect(result.items[0].name).toBe('Apple Red');
      expect(result.items[0].price).toBe(100);
      expect(result.items[1].name).toBe('Apple Green');
      expect(result.items[1].price).toBe(200);
    });

    it('should return last page correctly when there is remainder in division', async () => {
      // Arrange
      const entities = Array.from(
        { length: 23 },
        (_, i) =>
          new TestEntityWithPrice({
            name: `Entity ${i + 1}`,
            price: (i + 1) * 10,
          }),
      );
      await repository.bulkInsert(entities);
      const searchParams = new SearchParams({
        page: 3,
        per_page: 10,
      });

      // Act
      const result = await repository.search(searchParams);

      // Assert
      expect(result.items).toHaveLength(3);
      expect(result.total).toBe(23);
      expect(result.current_page).toBe(3);
      expect(result.per_page).toBe(10);
      expect(result.last_page).toBe(3);
    });
  });

  describe('[applySort]', () => {
    it('should return items without sorting when sort is null', async () => {
      // Arrange
      const items = [
        new TestEntityWithPrice({ name: 'Zebra', price: 100 }),
        new TestEntityWithPrice({ name: 'Apple', price: 200 }),
      ];

      // Act
      const result = await repository['applySort'](items, null, 'asc');

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Zebra');
      expect(result[1].name).toBe('Apple');
    });

    it('should return items without sorting when sort is not in sortableFields', async () => {
      // Arrange
      const items = [
        new TestEntityWithPrice({ name: 'Zebra', price: 100 }),
        new TestEntityWithPrice({ name: 'Apple', price: 200 }),
      ];

      // Act
      const result = await repository['applySort'](items, 'invalid', 'asc');

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Zebra');
      expect(result[1].name).toBe('Apple');
    });

    it('should sort by string field in ascending order', async () => {
      // Arrange
      const items = [
        new TestEntityWithPrice({ name: 'Zebra', price: 100 }),
        new TestEntityWithPrice({ name: 'Apple', price: 200 }),
        new TestEntityWithPrice({ name: 'Banana', price: 300 }),
      ];

      // Act
      const result = await repository['applySort'](items, 'name', 'asc');

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('Apple');
      expect(result[1].name).toBe('Banana');
      expect(result[2].name).toBe('Zebra');
    });

    it('should sort by string field in descending order', async () => {
      // Arrange
      const items = [
        new TestEntityWithPrice({ name: 'Apple', price: 100 }),
        new TestEntityWithPrice({ name: 'Banana', price: 200 }),
        new TestEntityWithPrice({ name: 'Zebra', price: 300 }),
      ];

      // Act
      const result = await repository['applySort'](items, 'name', 'desc');

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('Zebra');
      expect(result[1].name).toBe('Banana');
      expect(result[2].name).toBe('Apple');
    });

    it('should sort by numeric field in ascending order', async () => {
      // Arrange
      const items = [
        new TestEntityWithPrice({ name: 'A', price: 300 }),
        new TestEntityWithPrice({ name: 'B', price: 100 }),
        new TestEntityWithPrice({ name: 'C', price: 200 }),
      ];

      // Act
      const result = await repository['applySort'](items, 'price', 'asc');

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].price).toBe(100);
      expect(result[1].price).toBe(200);
      expect(result[2].price).toBe(300);
    });

    it('should sort by numeric field in descending order', async () => {
      // Arrange
      const items = [
        new TestEntityWithPrice({ name: 'A', price: 100 }),
        new TestEntityWithPrice({ name: 'B', price: 300 }),
        new TestEntityWithPrice({ name: 'C', price: 200 }),
      ];

      // Act
      const result = await repository['applySort'](items, 'price', 'desc');

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].price).toBe(300);
      expect(result[1].price).toBe(200);
      expect(result[2].price).toBe(100);
    });

    it('should use custom_getter when provided', async () => {
      // Arrange
      const items = [
        new TestEntityWithPrice({ name: 'A', price: 300 }),
        new TestEntityWithPrice({ name: 'B', price: 100 }),
        new TestEntityWithPrice({ name: 'C', price: 200 }),
      ];
      const customGetter = (sort: string, item: TestEntityWithPrice) => {
        if (sort === 'price') {
          return item.price * -1; // Invert values
        }
        return item[sort as keyof TestEntityWithPrice];
      };

      // Act
      const result = await repository['applySort'](
        items,
        'price',
        'asc',
        customGetter,
      );

      // Assert
      expect(result).toHaveLength(3);
      // With inverted getter, order should be reversed
      expect(result[0].price).toBe(300);
      expect(result[1].price).toBe(200);
      expect(result[2].price).toBe(100);
    });

    it('should handle equal values correctly (return 0)', async () => {
      // Arrange
      const items = [
        new TestEntityWithPrice({ name: 'Apple', price: 100 }),
        new TestEntityWithPrice({ name: 'Banana', price: 100 }),
        new TestEntityWithPrice({ name: 'Cherry', price: 100 }),
      ];

      // Act
      const result = await repository['applySort'](items, 'price', 'asc');

      // Assert
      expect(result).toHaveLength(3);
      // When values are equal, order should remain stable (original order preserved)
      expect(result[0].price).toBe(100);
      expect(result[1].price).toBe(100);
      expect(result[2].price).toBe(100);
      // All items should still be present
      expect(result.map((item) => item.name)).toContain('Apple');
      expect(result.map((item) => item.name)).toContain('Banana');
      expect(result.map((item) => item.name)).toContain('Cherry');
    });

    it('should not modify the original array', async () => {
      // Arrange
      const items = [
        new TestEntityWithPrice({ name: 'Zebra', price: 100 }),
        new TestEntityWithPrice({ name: 'Apple', price: 200 }),
      ];
      const originalOrder = items.map((item) => item.name);

      // Act
      await repository['applySort'](items, 'name', 'asc');

      // Assert
      expect(items.map((item) => item.name)).toEqual(originalOrder);
    });
  });

  describe('[applyPagination]', () => {
    it('should return first page correctly', async () => {
      // Arrange
      const items = Array.from(
        { length: 20 },
        (_, i) =>
          new TestEntityWithPrice({
            name: `Entity ${i + 1}`,
            price: (i + 1) * 10,
          }),
      );

      // Act
      const result = await repository['applyPagination'](items, 1, 10);

      // Assert
      expect(result).toHaveLength(10);
      expect(result[0].name).toBe('Entity 1');
      expect(result[9].name).toBe('Entity 10');
    });

    it('should return second page correctly', async () => {
      // Arrange
      const items = Array.from(
        { length: 20 },
        (_, i) =>
          new TestEntityWithPrice({
            name: `Entity ${i + 1}`,
            price: (i + 1) * 10,
          }),
      );

      // Act
      const result = await repository['applyPagination'](items, 2, 10);

      // Assert
      expect(result).toHaveLength(10);
      expect(result[0].name).toBe('Entity 11');
      expect(result[9].name).toBe('Entity 20');
    });

    it('should return empty page when page does not exist', async () => {
      // Arrange
      const items = Array.from(
        { length: 10 },
        (_, i) =>
          new TestEntityWithPrice({
            name: `Entity ${i + 1}`,
            price: (i + 1) * 10,
          }),
      );

      // Act
      const result = await repository['applyPagination'](items, 3, 10);

      // Assert
      expect(result).toHaveLength(0);
    });

    it('should return partial last page correctly', async () => {
      // Arrange
      const items = Array.from(
        { length: 23 },
        (_, i) =>
          new TestEntityWithPrice({
            name: `Entity ${i + 1}`,
            price: (i + 1) * 10,
          }),
      );

      // Act
      const result = await repository['applyPagination'](items, 3, 10);

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('Entity 21');
      expect(result[2].name).toBe('Entity 23');
    });

    it('should return all items when per_page is greater than total', async () => {
      // Arrange
      const items = Array.from(
        { length: 5 },
        (_, i) =>
          new TestEntityWithPrice({
            name: `Entity ${i + 1}`,
            price: (i + 1) * 10,
          }),
      );

      // Act
      const result = await repository['applyPagination'](items, 1, 10);

      // Assert
      expect(result).toHaveLength(5);
    });

    it('should return empty list when items is empty', async () => {
      // Arrange
      const items: TestEntityWithPrice[] = [];

      // Act
      const result = await repository['applyPagination'](items, 1, 10);

      // Assert
      expect(result).toHaveLength(0);
    });
  });

  describe('[sortableFields]', () => {
    it('should have sortableFields defined', () => {
      // Arrange & Act
      const repo = new TestInMemorySearchableRepository();

      // Assert
      expect(repo.sortableFields).toBeDefined();
      expect(Array.isArray(repo.sortableFields)).toBe(true);
      expect(repo.sortableFields).toContain('name');
      expect(repo.sortableFields).toContain('price');
    });
  });
});
