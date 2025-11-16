import { CategoryInMemoryRepository } from '@/category/infra/db/in-memory/category-in-memory.repository';
import {
  ListCategoriesUseCase,
  type ListCategoriesInput,
} from '@/category/application/use-cases/list-category/list-categories.use-case';
import { Category } from '@/category/domain/entities/category.entity';
import { CategorySearchParams } from '@/category/domain/repositories/category.repository';

describe('Unit: [ListCategoriesUseCase]', () => {
  let useCase: ListCategoriesUseCase;
  let repository: CategoryInMemoryRepository;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    useCase = new ListCategoriesUseCase(repository);
  });

  describe('[execute]', () => {
    it('should list categories with default pagination and call repository.search', async () => {
      // Arrange
      const category1 = Category.fake()
        .createCategory()
        .withName('Category 1')
        .build();
      const category2 = Category.fake()
        .createCategory()
        .withName('Category 2')
        .build();
      await repository.insert(category1);
      await repository.insert(category2);

      const input: ListCategoriesInput = {};
      const searchSpy = jest.spyOn(repository, 'search');

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(searchSpy).toHaveBeenCalledTimes(1);
      expect(searchSpy).toHaveBeenCalledWith(expect.any(CategorySearchParams));
      expect(output.items).toHaveLength(2);
      expect(output.total).toBe(2);
      expect(output.current_page).toBe(1);
      expect(output.per_page).toBe(15);
      expect(output.last_page).toBe(1);
    });

    it('should list categories with custom pagination and call repository.search', async () => {
      // Arrange
      const categories = Category.fake()
        .createManyCategories(5)
        .withName((index) => `Category ${index + 1}`)
        .build();
      await repository.bulkInsert(categories);

      const input: ListCategoriesInput = {
        page: 1,
        per_page: 2,
      };
      const searchSpy = jest.spyOn(repository, 'search');

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(searchSpy).toHaveBeenCalledTimes(1);
      expect(output.items).toHaveLength(2);
      expect(output.total).toBe(5);
      expect(output.current_page).toBe(1);
      expect(output.per_page).toBe(2);
      expect(output.last_page).toBe(3);
    });

    it('should list categories with filter and call repository.search', async () => {
      // Arrange
      const category1 = Category.fake()
        .createCategory()
        .withName('Action Movies')
        .build();
      const category2 = Category.fake()
        .createCategory()
        .withName('Comedy Movies')
        .build();
      const category3 = Category.fake()
        .createCategory()
        .withName('Action Games')
        .build();
      await repository.insert(category1);
      await repository.insert(category2);
      await repository.insert(category3);

      const input: ListCategoriesInput = {
        filter: 'action',
      };
      const searchSpy = jest.spyOn(repository, 'search');

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(searchSpy).toHaveBeenCalledTimes(1);
      expect(output.items).toHaveLength(2);
      expect(output.total).toBe(2);
      expect(
        output.items.every((item) =>
          item.name.toLowerCase().includes('action'),
        ),
      ).toBe(true);
    });

    it('should list categories with sort and call repository.search', async () => {
      // Arrange
      const category1 = Category.fake()
        .createCategory()
        .withName('Zebra Category')
        .build();
      const category2 = Category.fake()
        .createCategory()
        .withName('Apple Category')
        .build();
      const category3 = Category.fake()
        .createCategory()
        .withName('Banana Category')
        .build();
      await repository.insert(category1);
      await repository.insert(category2);
      await repository.insert(category3);

      const input: ListCategoriesInput = {
        sort: 'name',
        sort_dir: 'asc',
      };
      const searchSpy = jest.spyOn(repository, 'search');

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(searchSpy).toHaveBeenCalledTimes(1);
      expect(output.items).toHaveLength(3);
      expect(output.items[0].name).toBe('Apple Category');
      expect(output.items[1].name).toBe('Banana Category');
      expect(output.items[2].name).toBe('Zebra Category');
    });

    it('should list categories with sort descending and call repository.search', async () => {
      // Arrange
      const category1 = Category.fake()
        .createCategory()
        .withName('Apple Category')
        .build();
      const category2 = Category.fake()
        .createCategory()
        .withName('Banana Category')
        .build();
      const category3 = Category.fake()
        .createCategory()
        .withName('Zebra Category')
        .build();
      await repository.insert(category1);
      await repository.insert(category2);
      await repository.insert(category3);

      const input: ListCategoriesInput = {
        sort: 'name',
        sort_dir: 'desc',
      };
      const searchSpy = jest.spyOn(repository, 'search');

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(searchSpy).toHaveBeenCalledTimes(1);
      expect(output.items).toHaveLength(3);
      expect(output.items[0].name).toBe('Zebra Category');
      expect(output.items[1].name).toBe('Banana Category');
      expect(output.items[2].name).toBe('Apple Category');
    });

    it('should return empty list when no categories exist', async () => {
      // Arrange
      const input: ListCategoriesInput = {};
      const searchSpy = jest.spyOn(repository, 'search');

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(searchSpy).toHaveBeenCalledTimes(1);
      expect(output.items).toHaveLength(0);
      expect(output.total).toBe(0);
      expect(output.current_page).toBe(1);
      expect(output.per_page).toBe(15);
      expect(output.last_page).toBe(0);
    });

    it('should return empty list when filter finds nothing', async () => {
      // Arrange
      const category1 = Category.fake()
        .createCategory()
        .withName('Action Movies')
        .build();
      const category2 = Category.fake()
        .createCategory()
        .withName('Comedy Movies')
        .build();
      await repository.insert(category1);
      await repository.insert(category2);

      const input: ListCategoriesInput = {
        filter: 'Horror',
      };
      const searchSpy = jest.spyOn(repository, 'search');

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(searchSpy).toHaveBeenCalledTimes(1);
      expect(output.items).toHaveLength(0);
      expect(output.total).toBe(0);
    });

    it('should list categories with pagination on second page', async () => {
      // Arrange
      const categories = Category.fake()
        .createManyCategories(5)
        .withName((index) => `Category ${index + 1}`)
        .build();
      await repository.bulkInsert(categories);

      const input: ListCategoriesInput = {
        page: 2,
        per_page: 2,
      };
      const searchSpy = jest.spyOn(repository, 'search');

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(searchSpy).toHaveBeenCalledTimes(1);
      expect(output.items).toHaveLength(2);
      expect(output.total).toBe(5);
      expect(output.current_page).toBe(2);
      expect(output.per_page).toBe(2);
      expect(output.last_page).toBe(3);
    });

    it('should return output with all category properties correctly mapped', async () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Category Name')
        .withDescription('Category Description')
        .activate()
        .build();
      await repository.insert(category);

      const input: ListCategoriesInput = {};

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(output.items).toHaveLength(1);
      expect(output.items[0]).toMatchObject({
        id: category.id.value,
        name: category.name,
        description: category.description,
        is_active: category.is_active,
      });
      expect(output.items[0].created_at).toBeInstanceOf(Date);
      expect(output.items[0].created_at).toEqual(category.created_at);
    });

    it('should list categories with null filter and call repository.search', async () => {
      // Arrange
      const category1 = Category.fake()
        .createCategory()
        .withName('Category 1')
        .build();
      const category2 = Category.fake()
        .createCategory()
        .withName('Category 2')
        .build();
      await repository.insert(category1);
      await repository.insert(category2);

      const input: ListCategoriesInput = {
        filter: null,
      };
      const searchSpy = jest.spyOn(repository, 'search');

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(searchSpy).toHaveBeenCalledTimes(1);
      expect(output.items).toHaveLength(2);
      expect(output.total).toBe(2);
    });

    it('should list categories with null sort and call repository.search', async () => {
      // Arrange
      const category1 = Category.fake()
        .createCategory()
        .withName('Category 1')
        .build();
      const category2 = Category.fake()
        .createCategory()
        .withName('Category 2')
        .build();
      await repository.insert(category1);
      await repository.insert(category2);

      const input: ListCategoriesInput = {
        sort: null,
        sort_dir: null,
      };
      const searchSpy = jest.spyOn(repository, 'search');

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(searchSpy).toHaveBeenCalledTimes(1);
      expect(output.items).toHaveLength(2);
      expect(output.total).toBe(2);
    });

    it('should verify the CategorySearchParams passed to search has correct values', async () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Category Name')
        .build();
      await repository.insert(category);

      const input: ListCategoriesInput = {
        page: 2,
        per_page: 10,
        sort: 'name',
        sort_dir: 'asc',
        filter: 'test',
      };
      const searchSpy = jest.spyOn(repository, 'search');

      // Act
      await useCase.execute(input);

      // Assert
      expect(searchSpy).toHaveBeenCalledTimes(1);
      const calledParams = searchSpy.mock.calls[0][0];
      expect(calledParams).toBeInstanceOf(CategorySearchParams);
      expect(calledParams.page).toBe(2);
      expect(calledParams.per_page).toBe(10);
      expect(calledParams.sort).toBe('name');
      expect(calledParams.sort_dir).toBe('asc');
      expect(calledParams.filter).toBe('test');
    });

    it('should return PaginatedOutput with correct structure', async () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Category Name')
        .build();
      await repository.insert(category);

      const input: ListCategoriesInput = {};

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(output).toHaveProperty('items');
      expect(output).toHaveProperty('total');
      expect(output).toHaveProperty('current_page');
      expect(output).toHaveProperty('per_page');
      expect(output).toHaveProperty('last_page');
      expect(Array.isArray(output.items)).toBe(true);
      expect(typeof output.total).toBe('number');
      expect(typeof output.current_page).toBe('number');
      expect(typeof output.per_page).toBe('number');
      expect(typeof output.last_page).toBe('number');
    });

    it('should list categories with combined filter, sort and pagination', async () => {
      // Arrange
      const category1 = Category.fake()
        .createCategory()
        .withName('Action A')
        .build();
      const category2 = Category.fake()
        .createCategory()
        .withName('Action B')
        .build();
      const category3 = Category.fake()
        .createCategory()
        .withName('Comedy A')
        .build();
      const category4 = Category.fake()
        .createCategory()
        .withName('Action C')
        .build();
      await repository.insert(category1);
      await repository.insert(category2);
      await repository.insert(category3);
      await repository.insert(category4);

      const input: ListCategoriesInput = {
        page: 1,
        per_page: 2,
        filter: 'action',
        sort: 'name',
        sort_dir: 'asc',
      };
      const searchSpy = jest.spyOn(repository, 'search');

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(searchSpy).toHaveBeenCalledTimes(1);
      expect(output.items).toHaveLength(2);
      expect(output.total).toBe(3);
      expect(output.items[0].name).toBe('Action A');
      expect(output.items[1].name).toBe('Action B');
    });
  });
});
