import { Sequelize } from 'sequelize-typescript';
import { CategoryModel } from '@core/category/infra/db/sequelize/model/category.model';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/repositories/category.sequelize.repository';
import { Category } from '@core/category/domain/entities/category.entity';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import {
  CategorySearchParams,
  CategorySearchResult,
} from '@core/category/domain/repositories/category.repository';
import { setupSequelize } from '@core/shared/infra/testing/helpers';

describe('Integration: [CategorySequelizeRepository]', () => {
  setupSequelize({ models: [CategoryModel] });
  let repository: CategorySequelizeRepository;

  beforeEach(() => {
    repository = new CategorySequelizeRepository(CategoryModel);
  });

  describe('[insert]', () => {
    it('should insert a category', async () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('New Category')
        .build();

      // Act
      await repository.insert(category);

      // Assert
      const found = await CategoryModel.findByPk(category.id.value);
      expect(found).not.toBeNull();
      expect(found?.id).toBe(category.id.value);
      expect(found?.name).toBe(category.name);
      expect(found?.description).toBe(category.description);
      expect(found?.is_active).toBe(category.is_active);
      expect(found?.created_at).toEqual(category.created_at);
    });

    it('should insert a category with all fields', async () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Complete Category')
        .withDescription('Complete Description')
        .activate()
        .build();

      // Act
      await repository.insert(category);

      // Assert
      const found = await CategoryModel.findByPk(category.id.value);
      expect(found).not.toBeNull();
      expect(found?.name).toBe('Complete Category');
      expect(found?.description).toBe('Complete Description');
      expect(found?.is_active).toBe(true);
    });

    it('should insert a category with null description', async () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Category Without Description')
        .withDescription(null)
        .build();

      // Act
      await repository.insert(category);

      // Assert
      const found = await CategoryModel.findByPk(category.id.value);
      expect(found).not.toBeNull();
      expect(found?.description).toBeNull();
    });
  });

  describe('[bulkInsert]', () => {
    it('should insert multiple categories', async () => {
      // Arrange
      const categories = Category.fake()
        .createManyCategories(3)
        .withName((index) => `Category ${index + 1}`)
        .build();

      // Act
      await repository.bulkInsert(categories);

      // Assert
      const all = await CategoryModel.findAll();
      expect(all).toHaveLength(3);
      categories.forEach((category) => {
        const found = all.find((c) => c.id === category.id.value);
        expect(found).toBeDefined();
        expect(found?.name).toBe(category.name);
      });
    });

    it('should insert empty array without errors', async () => {
      // Arrange
      const categories: Category[] = [];

      // Act
      await repository.bulkInsert(categories);

      // Assert
      const all = await CategoryModel.findAll();
      expect(all).toHaveLength(0);
    });
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
      const category = Category.fake()
        .createCategory()
        .withName('Test Category')
        .build();
      await repository.insert(category);

      // Act
      const result = await repository.findById(category.id);

      // Assert
      expect(result).toBeInstanceOf(Category);
      expect(result?.id.value).toBe(category.id.value);
      expect(result?.name).toBe(category.name);
      expect(result?.description).toBe(category.description);
      expect(result?.is_active).toBe(category.is_active);
      expect(result?.created_at).toEqual(category.created_at);
    });

    it('should return entity with correct properties', async () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Detailed Category')
        .withDescription('Detailed Description')
        .deactivate()
        .build();
      await repository.insert(category);

      // Act
      const result = await repository.findById(category.id);

      // Assert
      expect(result).not.toBeNull();
      expect(result?.toJSON()).toEqual(category.toJSON());
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
      const categories = Category.fake()
        .createManyCategories(2)
        .withName((index) => ['Category A', 'Category B'][index])
        .build();
      await repository.bulkInsert(categories);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(result).toHaveLength(2);
      expect(result.map((e) => e.id.value)).toEqual(
        categories.map((e) => e.id.value),
      );
      expect(result.map((e) => e.name)).toEqual(categories.map((e) => e.name));
    });

    it('should return all entities in correct format', async () => {
      // Arrange
      const categories = Category.fake()
        .createManyCategories(3)
        .withName((index) => `Category ${index + 1}`)
        .build();
      await repository.bulkInsert(categories);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(result).toHaveLength(3);
      result.forEach((entity) => {
        expect(entity).toBeInstanceOf(Category);
        expect(entity.id).toBeInstanceOf(Uuid);
      });
    });
  });

  describe('[update]', () => {
    it('should throw NotFoundError when entity does not exist', async () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Non-existent')
        .build();

      // Act & Assert
      await expect(repository.update(category)).rejects.toBeInstanceOf(
        NotFoundError,
      );
      await expect(repository.update(category)).rejects.toThrow(
        `${Category.name} not found with id ${category.id.value}`,
      );
    });

    it('should update existing entity', async () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Before')
        .withDescription('Old Description')
        .build();
      await repository.insert(category);

      const updated = Category.fake()
        .createCategory()
        .withUuid(category.id)
        .withName('After')
        .withDescription('New Description')
        .build();

      // Act
      await repository.update(updated);

      // Assert
      const found = await repository.findById(category.id);
      expect(found?.name).toBe('After');
      expect(found?.description).toBe('New Description');
      expect(found?.id.value).toBe(updated.id.value);
      expect(found?.name).toBe(updated.name);
      expect(found?.description).toBe(updated.description);
      expect(found?.is_active).toBe(updated.is_active);
    });

    it('should update is_active status', async () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Active Category')
        .activate()
        .build();
      await repository.insert(category);

      const updated = Category.fake()
        .createCategory()
        .withUuid(category.id)
        .withName('Active Category')
        .deactivate()
        .build();

      // Act
      await repository.update(updated);

      // Assert
      const found = await repository.findById(category.id);
      expect(found?.is_active).toBe(false);
    });

    it('should update description to null', async () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Category')
        .withDescription('Some Description')
        .build();
      await repository.insert(category);

      const updated = Category.fake()
        .createCategory()
        .withUuid(category.id)
        .withName('Category')
        .withDescription(null)
        .build();

      // Act
      await repository.update(updated);

      // Assert
      const found = await repository.findById(category.id);
      expect(found?.description).toBeNull();
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
      const category = Category.fake()
        .createCategory()
        .withName('Remove')
        .build();
      await repository.insert(category);

      // Act
      await repository.delete(category.id);

      // Assert
      const all = await repository.findAll();
      expect(all).toHaveLength(0);
      const found = await repository.findById(category.id);
      expect(found).toBeNull();
    });

    it('should delete only the specified entity', async () => {
      // Arrange
      const categories = Category.fake()
        .createManyCategories(3)
        .withName((index) => `Category ${index + 1}`)
        .build();
      await repository.bulkInsert(categories);

      // Act
      await repository.delete(categories[1].id);

      // Assert
      const all = await repository.findAll();
      expect(all).toHaveLength(2);
      expect(
        all.find((c) => c.id.value === categories[1].id.value),
      ).toBeUndefined();
    });
  });

  describe('[search]', () => {
    it('should return empty SearchResult when there are no entities', async () => {
      // Arrange
      const searchParams = new CategorySearchParams();

      // Act
      const result = await repository.search(searchParams);

      // Assert
      expect(result).toBeInstanceOf(CategorySearchResult);
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.current_page).toBe(1);
      expect(result.per_page).toBe(15);
      expect(result.last_page).toBe(0);
    });

    it('should return all entities when there is no filter', async () => {
      // Arrange
      const categories = Category.fake()
        .createManyCategories(3)
        .withName((index) => ['Category A', 'Category B', 'Category C'][index])
        .build();
      await repository.bulkInsert(categories);
      const searchParams = new CategorySearchParams();

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
      const categories = Category.fake()
        .createManyCategories(3)
        .withName(
          (index) => ['Action Movies', 'Comedy Movies', 'Action Games'][index],
        )
        .build();
      await repository.bulkInsert(categories);
      const searchParams = new CategorySearchParams({ filter: 'action' });

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
      const categories = Category.fake()
        .createManyCategories(3)
        .withName(
          (index) => ['Action Movies', 'Comedy Movies', 'ACTION GAMES'][index],
        )
        .build();
      await repository.bulkInsert(categories);
      const searchParams = new CategorySearchParams({ filter: 'ACTION' });

      // Act
      const result = await repository.search(searchParams);

      // Assert
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should return empty list when filter finds nothing', async () => {
      // Arrange
      const categories = Category.fake()
        .createManyCategories(2)
        .withName((index) => ['Action Movies', 'Comedy Movies'][index])
        .build();
      await repository.bulkInsert(categories);
      const searchParams = new CategorySearchParams({ filter: 'Horror' });

      // Act
      const result = await repository.search(searchParams);

      // Assert
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should sort entities by name in ascending order', async () => {
      // Arrange
      const categories = Category.fake()
        .createManyCategories(3)
        .withName(
          (index) =>
            ['Zebra Category', 'Apple Category', 'Banana Category'][index],
        )
        .build();
      await repository.bulkInsert(categories);
      const searchParams = new CategorySearchParams({
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
      const categories = Category.fake()
        .createManyCategories(3)
        .withName(
          (index) =>
            ['Apple Category', 'Banana Category', 'Zebra Category'][index],
        )
        .build();
      await repository.bulkInsert(categories);
      const searchParams = new CategorySearchParams({
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
      const categories = Category.fake()
        .createManyCategories(3)
        .withName((index) => ['Category C', 'Category A', 'Category B'][index])
        .withCreatedAt((index) => [date3, date1, date2][index])
        .build();
      await repository.bulkInsert(categories);
      const searchParams = new CategorySearchParams({
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
      const categories = Category.fake()
        .createManyCategories(3)
        .withName((index) => ['Category A', 'Category B', 'Category C'][index])
        .withCreatedAt((index) => [date1, date2, date3][index])
        .build();
      await repository.bulkInsert(categories);
      const searchParams = new CategorySearchParams({
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
      const categories = Category.fake()
        .createManyCategories(3)
        .withName((index) => ['Category A', 'Category B', 'Category C'][index])
        .withCreatedAt((index) => [date1, date2, date3][index])
        .build();
      await repository.bulkInsert(categories);
      const searchParams = new CategorySearchParams({
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
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-02');
      const date3 = new Date('2024-01-03');
      const categories = Category.fake()
        .createManyCategories(3)
        .withName(
          (index) =>
            ['Zebra Category', 'Apple Category', 'Banana Category'][index],
        )
        .withCreatedAt((index) => [date3, date1, date2][index])
        .build();
      await repository.bulkInsert(categories);
      const searchParams = new CategorySearchParams({
        sort: 'invalid_field',
        sort_dir: 'asc',
      });

      // Act
      const result = await repository.search(searchParams);

      // Assert
      expect(result.items).toHaveLength(3);
      expect(result.items[0].name).toBe('Zebra Category');
    });

    it('should paginate results correctly', async () => {
      // Arrange
      const categories = Category.fake()
        .createManyCategories(25)
        .withName((index) => `Category ${index + 1}`)
        .build();
      await repository.bulkInsert(categories);
      const searchParams = new CategorySearchParams({
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
      const categories = Category.fake()
        .createManyCategories(10)
        .withName((index) => `Category ${index + 1}`)
        .build();
      await repository.bulkInsert(categories);
      const searchParams = new CategorySearchParams({
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
      const categories = Category.fake()
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
      await repository.bulkInsert(categories);
      const searchParams = new CategorySearchParams({
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
      const categories = Category.fake()
        .createManyCategories(23)
        .withName((index) => `Category ${index + 1}`)
        .build();
      await repository.bulkInsert(categories);
      const searchParams = new CategorySearchParams({
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

  describe('[sortableFields]', () => {
    it('should have sortableFields defined', () => {
      // Arrange & Act
      const repo = new CategorySequelizeRepository(CategoryModel);

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
