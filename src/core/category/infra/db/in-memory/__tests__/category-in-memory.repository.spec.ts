jest.mock('uuid', () => ({
  v4: () => '550e8400-e29b-41d4-a716-446655440000',
  validate: () => true,
}));

import { CategoryInMemoryRepository } from '@core/category/infra/db/in-memory/category-in-memory.repository';
import { Category } from '@core/category/domain/entities/category.entity';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { SearchParams } from '@core/shared/domain/repositories/search-params';
import { SearchResult } from '@core/shared/domain/repositories/search-result';

describe('Unit: [CategoryInMemoryRepository]', () => {
  let repository: CategoryInMemoryRepository;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
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
      const entity = Category.fake()
        .createCategory()
        .withName('Test Category')
        .build();
      await repository.insert(entity);

      // Act
      const result = await repository.findById(entity.id);

      // Assert
      expect(result).toBeInstanceOf(Category);
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
      const entities = Category.fake()
        .createManyCategories(2)
        .withName((index) => ['Category A', 'Category B'][index])
        .build();
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
      const entity = Category.fake()
        .createCategory()
        .withName('New Category')
        .build();

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
      const entities = Category.fake()
        .createManyCategories(3)
        .withName((index) => `Category ${index + 1}`)
        .build();

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
      const entity = Category.fake()
        .createCategory()
        .withName('Non-existent')
        .build();

      // Act & Assert
      await expect(repository.update(entity)).rejects.toBeInstanceOf(
        NotFoundError,
      );
      await expect(repository.update(entity)).rejects.toThrow(
        `${Category.name} not found with id ${entity.id.value}`,
      );
    });

    it('should update existing entity', async () => {
      // Arrange
      const entity = Category.fake()
        .createCategory()
        .withName('Before')
        .build();
      await repository.insert(entity);
      const updated = Category.fake()
        .createCategory()
        .withUuid(entity.id)
        .withName('After')
        .build();

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
        `${Category.name} not found with id ${id.value}`,
      );
    });

    it('should remove existing entity', async () => {
      // Arrange
      const entity = Category.fake()
        .createCategory()
        .withName('Remove')
        .build();
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
      const entities = Category.fake()
        .createManyCategories(3)
        .withName((index) => ['Category A', 'Category B', 'Category C'][index])
        .build();
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

    it('should filter entities by name correctly', async () => {
      // Arrange
      const entities = Category.fake()
        .createManyCategories(3)
        .withName(
          (index) => ['Action Movies', 'Comedy Movies', 'Action Games'][index],
        )
        .build();
      await repository.bulkInsert(entities);
      const searchParams = new SearchParams({ filter: 'action' });

      // Act
      const result = await repository.search(searchParams);

      // Assert
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(
        result.items.every((item) =>
          item.name.toLowerCase().includes('action'),
        ),
      ).toBe(true);
    });

    it('should filter entities by name case-insensitively', async () => {
      // Arrange
      const entities = Category.fake()
        .createManyCategories(3)
        .withName(
          (index) => ['Action Movies', 'Comedy Movies', 'ACTION GAMES'][index],
        )
        .build();
      await repository.bulkInsert(entities);
      const searchParams = new SearchParams({ filter: 'ACTION' });

      // Act
      const result = await repository.search(searchParams);

      // Assert
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should return empty list when filter finds nothing', async () => {
      // Arrange
      const entities = Category.fake()
        .createManyCategories(2)
        .withName((index) => ['Action Movies', 'Comedy Movies'][index])
        .build();
      await repository.bulkInsert(entities);
      const searchParams = new SearchParams({ filter: 'Horror' });

      // Act
      const result = await repository.search(searchParams);

      // Assert
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should sort entities by name in ascending order', async () => {
      // Arrange
      const entities = Category.fake()
        .createManyCategories(3)
        .withName(
          (index) =>
            ['Zebra Category', 'Apple Category', 'Banana Category'][index],
        )
        .build();
      await repository.bulkInsert(entities);
      const searchParams = new SearchParams({
        sort: 'name',
        sort_dir: 'asc',
      });

      // Act
      const result = await repository.search(searchParams);

      // Assert
      expect(result.items).toHaveLength(3);
      expect(result.items[0].name).toBe('Apple Category');
      expect(result.items[1].name).toBe('Banana Category');
      expect(result.items[2].name).toBe('Zebra Category');
    });

    it('should sort entities by name in descending order', async () => {
      // Arrange
      const entities = Category.fake()
        .createManyCategories(3)
        .withName(
          (index) =>
            ['Apple Category', 'Banana Category', 'Zebra Category'][index],
        )
        .build();
      await repository.bulkInsert(entities);
      const searchParams = new SearchParams({
        sort: 'name',
        sort_dir: 'desc',
      });

      // Act
      const result = await repository.search(searchParams);

      // Assert
      expect(result.items).toHaveLength(3);
      expect(result.items[0].name).toBe('Zebra Category');
      expect(result.items[1].name).toBe('Banana Category');
      expect(result.items[2].name).toBe('Apple Category');
    });

    it('should sort entities by created_at in ascending order', async () => {
      // Arrange
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-02');
      const date3 = new Date('2024-01-03');
      const entities = Category.fake()
        .createManyCategories(3)
        .withName((index) => ['Category C', 'Category A', 'Category B'][index])
        .withCreatedAt((index) => [date3, date1, date2][index])
        .build();
      await repository.bulkInsert(entities);
      const searchParams = new SearchParams({
        sort: 'created_at',
        sort_dir: 'asc',
      });

      // Act
      const result = await repository.search(searchParams);

      // Assert
      expect(result.items).toHaveLength(3);
      expect(result.items[0].name).toBe('Category A');
      expect(result.items[1].name).toBe('Category B');
      expect(result.items[2].name).toBe('Category C');
    });

    it('should sort entities by created_at in descending order', async () => {
      // Arrange
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-02');
      const date3 = new Date('2024-01-03');
      const entities = Category.fake()
        .createManyCategories(3)
        .withName((index) => ['Category A', 'Category B', 'Category C'][index])
        .withCreatedAt((index) => [date1, date2, date3][index])
        .build();
      await repository.bulkInsert(entities);
      const searchParams = new SearchParams({
        sort: 'created_at',
        sort_dir: 'desc',
      });

      // Act
      const result = await repository.search(searchParams);

      // Assert
      expect(result.items).toHaveLength(3);
      expect(result.items[0].name).toBe('Category C');
      expect(result.items[1].name).toBe('Category B');
      expect(result.items[2].name).toBe('Category A');
    });

    it('should default to sort by created_at desc when sort is null', async () => {
      // Arrange
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-02');
      const date3 = new Date('2024-01-03');
      const entities = Category.fake()
        .createManyCategories(3)
        .withName((index) => ['Category A', 'Category B', 'Category C'][index])
        .withCreatedAt((index) => [date1, date2, date3][index])
        .build();
      await repository.bulkInsert(entities);
      const searchParams = new SearchParams({
        sort: null,
        sort_dir: 'asc',
      });

      // Act
      const result = await repository.search(searchParams);

      // Assert
      expect(result.items).toHaveLength(3);
      expect(result.items[0].name).toBe('Category C');
      expect(result.items[1].name).toBe('Category B');
      expect(result.items[2].name).toBe('Category A');
    });

    it('should not sort when field is not in sortableFields', async () => {
      // Arrange
      const entities = Category.fake()
        .createManyCategories(3)
        .withName(
          (index) =>
            ['Zebra Category', 'Apple Category', 'Banana Category'][index],
        )
        .build();
      await repository.bulkInsert(entities);
      const searchParams = new SearchParams({
        sort: 'invalid_field',
        sort_dir: 'asc',
      });

      // Act
      const result = await repository.search(searchParams);

      // Assert
      expect(result.items).toHaveLength(3);
      expect(result.items[0].name).toBe('Zebra Category');
      expect(result.items[1].name).toBe('Apple Category');
      expect(result.items[2].name).toBe('Banana Category');
    });

    it('should paginate results correctly', async () => {
      // Arrange
      const entities = Category.fake()
        .createManyCategories(25)
        .withName((index) => `Category ${index + 1}`)
        .build();
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
    });

    it('should return empty page when page does not exist', async () => {
      // Arrange
      const entities = Category.fake()
        .createManyCategories(10)
        .withName((index) => `Category ${index + 1}`)
        .build();
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
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-02');
      const date3 = new Date('2024-01-03');
      const date4 = new Date('2024-01-04');
      const entities = Category.fake()
        .createManyCategories(5)
        .withName(
          (index) =>
            [
              'Action Movie',
              'Action Game',
              'Comedy Movie',
              'Action Series',
              'Horror Movie',
            ][index],
        )
        .withCreatedAt((index) => [date1, date2, date3, date4, date2][index])
        .build();
      await repository.bulkInsert(entities);
      const searchParams = new SearchParams({
        filter: 'action',
        sort: 'created_at',
        sort_dir: 'asc',
        page: 1,
        per_page: 2,
      });

      // Act
      const result = await repository.search(searchParams);

      // Assert
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(3);
      expect(result.current_page).toBe(1);
      expect(result.per_page).toBe(2);
      expect(result.items[0].name).toBe('Action Movie');
      expect(result.items[1].name).toBe('Action Game');
    });

    it('should return last page correctly when there is remainder in division', async () => {
      // Arrange
      const entities = Category.fake()
        .createManyCategories(23)
        .withName((index) => `Category ${index + 1}`)
        .build();
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

  describe('[applyFilter]', () => {
    it('should return all items when filter is empty', async () => {
      // Arrange
      const items = Category.fake()
        .createManyCategories(2)
        .withName((index) => ['Category A', 'Category B'][index])
        .build();

      // Act
      const result = await repository['applyFilter'](items, '');

      // Assert
      expect(result).toHaveLength(2);
      expect(result).toEqual(items);
    });

    it('should no filter items when filter object is null', async () => {
      // Arrange
      const items = [
        Category.fake().createCategory().withName('Category A').build(),
      ];
      const filterSpy = jest.spyOn(items, 'filter' as any);

      // Act
      const itemsFiltered = await repository['applyFilter'](items, null);

      // Assert
      expect(filterSpy).not.toHaveBeenCalled();
      expect(itemsFiltered).toStrictEqual(items);
    });

    it('should return all items when filter is null', async () => {
      // Arrange
      const items = Category.fake()
        .createManyCategories(2)
        .withName((index) => ['Category A', 'Category B'][index])
        .build();

      // Act
      const result = await repository['applyFilter'](items, null as any);

      // Assert
      expect(result).toHaveLength(2);
      expect(result).toEqual(items);
    });

    it('should filter items using filter parameter', async () => {
      // Arrange
      const items = Category.fake()
        .createManyCategories(3)
        .withName((index) => ['test', 'TEST', 'fake'][index])
        .build();
      const filterSpy = jest.spyOn(items, 'filter' as any);

      // Act
      const itemsFiltered = await repository['applyFilter'](items, 'TEST');

      // Assert
      expect(filterSpy).toHaveBeenCalledTimes(1);
      expect(itemsFiltered).toStrictEqual([items[0], items[1]]);
    });

    it('should filter items by name case-insensitively', async () => {
      // Arrange
      const items = Category.fake()
        .createManyCategories(3)
        .withName(
          (index) => ['Action Movies', 'Comedy Movies', 'ACTION GAMES'][index],
        )
        .build();

      // Act
      const result = await repository['applyFilter'](items, 'action');

      // Assert
      expect(result).toHaveLength(2);
      expect(
        result.every((item) => item.name.toLowerCase().includes('action')),
      ).toBe(true);
    });
  });

  describe('[applySort]', () => {
    it('should sort by created_at when sort param is null', async () => {
      // Arrange
      const created_at = new Date();
      const items = Category.fake()
        .createManyCategories(3)
        .withName((index) => ['test', 'TEST', 'fake'][index])
        .withCreatedAt(
          (index) =>
            [
              created_at,
              new Date(created_at.getTime() + 100),
              new Date(created_at.getTime() + 200),
            ][index],
        )
        .build();

      // Act
      const itemsSorted = await repository['applySort'](items, null, null);

      // Assert
      expect(itemsSorted).toStrictEqual([items[2], items[1], items[0]]);
    });

    it('should default to created_at desc when sort is null', async () => {
      // Arrange
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-02');
      const date3 = new Date('2024-01-03');
      const items = Category.fake()
        .createManyCategories(3)
        .withName((index) => ['Category A', 'Category B', 'Category C'][index])
        .withCreatedAt((index) => [date1, date2, date3][index])
        .build();

      // Act
      const result = await repository['applySort'](items, null, 'asc');

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('Category C');
      expect(result[1].name).toBe('Category B');
      expect(result[2].name).toBe('Category A');
    });

    it('should sort by name', async () => {
      // Arrange
      const items = Category.fake()
        .createManyCategories(3)
        .withName((index) => ['c', 'b', 'a'][index])
        .build();

      // Act & Assert
      let itemsSorted = await repository['applySort'](items, 'name', 'asc');
      expect(itemsSorted).toStrictEqual([items[2], items[1], items[0]]);

      itemsSorted = await repository['applySort'](items, 'name', 'desc');
      expect(itemsSorted).toStrictEqual([items[0], items[1], items[2]]);
    });

    it('should sort by name when sort is provided', async () => {
      // Arrange
      const items = Category.fake()
        .createManyCategories(3)
        .withName(
          (index) =>
            ['Zebra Category', 'Apple Category', 'Banana Category'][index],
        )
        .build();

      // Act
      const result = await repository['applySort'](items, 'name', 'asc');

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('Apple Category');
      expect(result[1].name).toBe('Banana Category');
      expect(result[2].name).toBe('Zebra Category');
    });

    it('should sort by created_at when sort is provided', async () => {
      // Arrange
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-02');
      const date3 = new Date('2024-01-03');
      const items = Category.fake()
        .createManyCategories(3)
        .withName((index) => ['Category C', 'Category A', 'Category B'][index])
        .withCreatedAt((index) => [date3, date1, date2][index])
        .build();

      // Act
      const result = await repository['applySort'](items, 'created_at', 'asc');

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('Category A');
      expect(result[1].name).toBe('Category B');
      expect(result[2].name).toBe('Category C');
    });
  });

  describe('[sortableFields]', () => {
    it('should have sortableFields defined', () => {
      // Arrange & Act
      const repo = new CategoryInMemoryRepository();

      // Assert
      expect(repo.sortableFields).toBeDefined();
      expect(Array.isArray(repo.sortableFields)).toBe(true);
      expect(repo.sortableFields).toContain('name');
      expect(repo.sortableFields).toContain('created_at');
      expect(repo.sortableFields).toHaveLength(2);
    });
  });

  describe('[getEntity]', () => {
    it('should return Category class', () => {
      // Arrange & Act
      const EntityClass = repository.getEntity();

      // Assert
      expect(EntityClass).toBe(Category);
    });
  });
});
