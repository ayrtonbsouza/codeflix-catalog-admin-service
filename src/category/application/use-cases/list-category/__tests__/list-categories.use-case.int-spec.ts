import { CategorySequelizeRepository } from '@/category/infra/db/sequelize/repositories/category.sequelize.repository';
import {
  ListCategoriesUseCase,
  type ListCategoriesInput,
} from '@/category/application/use-cases/list-category/list-categories.use-case';
import { setupSequelize } from '@/shared/infra/testing/helpers';
import { CategoryModel } from '@/category/infra/db/sequelize/model/category.model';
import { Category } from '@/category/domain/entities/category.entity';

describe('Integration: [ListCategoriesUseCase]', () => {
  let useCase: ListCategoriesUseCase;
  let repository: CategorySequelizeRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new CategorySequelizeRepository(CategoryModel);
    useCase = new ListCategoriesUseCase(repository);
  });

  describe('[execute]', () => {
    it('should list categories with default pagination and persist in database', async () => {
      // Arrange
      const category1 = Category.fake()
        .createCategory()
        .withName('Category 1')
        .withDescription('Description 1')
        .activate()
        .build();
      const category2 = Category.fake()
        .createCategory()
        .withName('Category 2')
        .withDescription('Description 2')
        .activate()
        .build();
      await repository.insert(category1);
      await repository.insert(category2);

      const input: ListCategoriesInput = {};

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(output.items).toHaveLength(2);
      expect(output.total).toBe(2);
      expect(output.current_page).toBe(1);
      expect(output.per_page).toBe(15);
      expect(output.last_page).toBe(1);

      const found1 = await CategoryModel.findByPk(category1.id.value);
      const found2 = await CategoryModel.findByPk(category2.id.value);
      expect(found1).not.toBeNull();
      expect(found2).not.toBeNull();
    });

    it('should list categories with custom pagination and persist in database', async () => {
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

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(output.items).toHaveLength(2);
      expect(output.total).toBe(5);
      expect(output.current_page).toBe(1);
      expect(output.per_page).toBe(2);
      expect(output.last_page).toBe(3);

      const allCategories = await CategoryModel.findAll();
      expect(allCategories).toHaveLength(5);
    });

    it('should list categories with filter and persist in database', async () => {
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

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(output.items).toHaveLength(2);
      expect(output.total).toBe(2);
      expect(
        output.items.every((item) =>
          item.name.toLowerCase().includes('action'),
        ),
      ).toBe(true);

      const found1 = await CategoryModel.findByPk(category1.id.value);
      const found3 = await CategoryModel.findByPk(category3.id.value);
      expect(found1).not.toBeNull();
      expect(found3).not.toBeNull();
    });

    it('should list categories with sort and persist in database', async () => {
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

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(output.items).toHaveLength(3);
      expect(output.items[0].name).toBe('Apple Category');
      expect(output.items[1].name).toBe('Banana Category');
      expect(output.items[2].name).toBe('Zebra Category');

      const allCategories = await CategoryModel.findAll();
      expect(allCategories).toHaveLength(3);
    });

    it('should list categories with sort descending and persist in database', async () => {
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

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(output.items).toHaveLength(3);
      expect(output.items[0].name).toBe('Zebra Category');
      expect(output.items[1].name).toBe('Banana Category');
      expect(output.items[2].name).toBe('Apple Category');
    });

    it('should return empty list when no categories exist in database', async () => {
      // Arrange
      const input: ListCategoriesInput = {};

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(output.items).toHaveLength(0);
      expect(output.total).toBe(0);
      expect(output.current_page).toBe(1);
      expect(output.per_page).toBe(15);
      expect(output.last_page).toBe(0);

      const allCategories = await CategoryModel.findAll();
      expect(allCategories).toHaveLength(0);
    });

    it('should return empty list when filter finds nothing in database', async () => {
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

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(output.items).toHaveLength(0);
      expect(output.total).toBe(0);

      const allCategories = await CategoryModel.findAll();
      expect(allCategories).toHaveLength(2);
    });

    it('should list categories with pagination on second page and persist in database', async () => {
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

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(output.items).toHaveLength(2);
      expect(output.total).toBe(5);
      expect(output.current_page).toBe(2);
      expect(output.per_page).toBe(2);
      expect(output.last_page).toBe(3);

      const allCategories = await CategoryModel.findAll();
      expect(allCategories).toHaveLength(5);
    });

    it('should return output with all category properties correctly mapped from database', async () => {
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

      const found = await CategoryModel.findByPk(category.id.value);
      expect(found).not.toBeNull();
      expect(found?.id).toBe(output.items[0].id);
      expect(found?.name).toBe(output.items[0].name);
      expect(found?.description).toBe(output.items[0].description);
      expect(found?.is_active).toBe(output.items[0].is_active);
    });

    it('should list categories with null filter and persist in database', async () => {
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

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(output.items).toHaveLength(2);
      expect(output.total).toBe(2);

      const allCategories = await CategoryModel.findAll();
      expect(allCategories).toHaveLength(2);
    });

    it('should list categories with null sort and persist in database', async () => {
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

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(output.items).toHaveLength(2);
      expect(output.total).toBe(2);

      const allCategories = await CategoryModel.findAll();
      expect(allCategories).toHaveLength(2);
    });

    it('should return PaginatedOutput with correct structure from database', async () => {
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

    it('should list categories with combined filter, sort and pagination from database', async () => {
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

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(output.items).toHaveLength(2);
      expect(output.total).toBe(3);
      expect(output.items[0].name).toBe('Action A');
      expect(output.items[1].name).toBe('Action B');

      const allCategories = await CategoryModel.findAll();
      expect(allCategories).toHaveLength(4);
    });

    it('should list categories with inactive status and persist in database', async () => {
      // Arrange
      const category1 = Category.fake()
        .createCategory()
        .withName('Active Category')
        .activate()
        .build();
      const category2 = Category.fake()
        .createCategory()
        .withName('Inactive Category')
        .deactivate()
        .build();
      await repository.insert(category1);
      await repository.insert(category2);

      const input: ListCategoriesInput = {};

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(output.items).toHaveLength(2);
      expect(output.items[0].is_active).toBeDefined();
      expect(output.items[1].is_active).toBeDefined();

      const found1 = await CategoryModel.findByPk(category1.id.value);
      const found2 = await CategoryModel.findByPk(category2.id.value);
      expect(found1?.is_active).toBe(true);
      expect(found2?.is_active).toBe(false);
    });

    it('should list categories with null description and persist in database', async () => {
      // Arrange
      const category1 = Category.fake()
        .createCategory()
        .withName('Category 1')
        .withDescription(null)
        .build();
      const category2 = Category.fake()
        .createCategory()
        .withName('Category 2')
        .withDescription('Description')
        .build();
      await repository.insert(category1);
      await repository.insert(category2);

      const input: ListCategoriesInput = {};

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(output.items).toHaveLength(2);
      expect(output.items[0].description).toBeDefined();
      expect(output.items[1].description).toBeDefined();

      const found1 = await CategoryModel.findByPk(category1.id.value);
      const found2 = await CategoryModel.findByPk(category2.id.value);
      expect(found1?.description).toBeNull();
      expect(found2?.description).toBe('Description');
    });
  });
});
