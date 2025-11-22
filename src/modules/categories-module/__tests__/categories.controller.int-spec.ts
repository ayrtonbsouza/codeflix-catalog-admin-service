import { Test, TestingModule } from '@nestjs/testing';
import type { ICategoryRepository } from '@core/category/domain/repositories/category.repository';
import { CategoriesController } from '@modules/categories-module/categories.controller';
import { ConfigModule } from '@modules/config-module/config.module';
import { DatabaseModule } from '@modules/database-module/database.module';
import { CategoriesModule } from '@modules/categories-module/categories.module';
import { CATEGORIES_PROVIDERS } from '@modules/categories-module/categories.providers';
import { CreateCategoryUseCase } from '@core/category/application/use-cases/create-category/create-category.use-case';
import { UpdateCategoryUseCase } from '@core/category/application/use-cases/update-category/update-category.use-case';
import { ListCategoriesUseCase } from '@core/category/application/use-cases/list-category/list-categories.use-case';
import { GetCategoryUseCase } from '@core/category/application/use-cases/get-category/get-category.use-case';
import { DeleteCategoryUseCase } from '@core/category/application/use-cases/delete-category/delete-category.use-case';
import { CategoryModel } from '@core/category/infra/db/sequelize/model/category.model';
import {
  CategoriesCollectionPresenter,
  CategoriesPresenter,
} from '@modules/categories-module/categories.presenter';
import type { CreateCategoryDto } from '@modules/categories-module/dto/create-category.dto';
import type { UpdateCategoryDto } from '@modules/categories-module/dto/update-category.dto';
import type { SearchCategoryDto } from '@modules/categories-module/dto/search-category.dto';
import type { SortDirection } from '@core/shared/domain/repositories/search-params';
import { setupSequelize } from '@core/shared/infra/testing/helpers';

describe('Integration: [CategoriesController]', () => {
  let controller: CategoriesController;
  let repository: ICategoryRepository;
  let module: TestingModule;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(async () => {
    // Arrange
    module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), DatabaseModule, CategoriesModule],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    repository = module.get<ICategoryRepository>(
      CATEGORIES_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    );
  });

  afterEach(async () => {
    // Cleanup
    await CategoryModel.destroy({ where: {}, truncate: true });
  });

  afterAll(async () => {
    await module.close();
  });

  describe('[initialization]', () => {
    it('should be defined', () => {
      // Assert
      expect(controller).toBeDefined();
      expect(controller['createCategoryUseCase']).toBeInstanceOf(
        CreateCategoryUseCase,
      );
      expect(controller['updateCategoryUseCase']).toBeInstanceOf(
        UpdateCategoryUseCase,
      );
      expect(controller['listCategoriesUseCase']).toBeInstanceOf(
        ListCategoriesUseCase,
      );
      expect(controller['getCategoryUseCase']).toBeInstanceOf(
        GetCategoryUseCase,
      );
      expect(controller['deleteCategoryUseCase']).toBeInstanceOf(
        DeleteCategoryUseCase,
      );
    });

    it('should have repository injected', () => {
      // Assert
      expect(repository).toBeDefined();
    });
  });

  describe('[create]', () => {
    it('should create a category', async () => {
      // Arrange
      const input: CreateCategoryDto = {
        name: 'Movie',
        description: 'some description',
        is_active: true,
      };

      // Act
      const presenter = await controller.create(input);

      // Assert
      expect(presenter).toBeInstanceOf(CategoriesPresenter);
      expect(presenter.name).toBe(input.name);
      expect(presenter.description).toBe(input.description);
      expect(presenter.is_active).toBe(input.is_active);
      expect(presenter.id).toBeDefined();
      expect(presenter.created_at).toBeInstanceOf(Date);

      // Verify persistence
      const found = await CategoryModel.findByPk(presenter.id);
      expect(found).not.toBeNull();
      expect(found?.name).toBe(input.name);
      expect(found?.description).toBe(input.description);
      expect(found?.is_active).toBe(input.is_active);
    });

    it('should create a category with minimal data', async () => {
      // Arrange
      const input: CreateCategoryDto = {
        name: 'Series',
      };

      // Act
      const presenter = await controller.create(input);

      // Assert
      expect(presenter).toBeInstanceOf(CategoriesPresenter);
      expect(presenter.name).toBe('Series');
      expect(presenter.description).toBeNull();
      expect(presenter.is_active).toBe(true);

      // Verify persistence
      const found = await CategoryModel.findByPk(presenter.id);
      expect(found).not.toBeNull();
      expect(found?.name).toBe('Series');
      expect(found?.description).toBeNull();
      expect(found?.is_active).toBe(true);
    });

    it('should create a category with null description', async () => {
      // Arrange
      const input: CreateCategoryDto = {
        name: 'Documentary',
        description: null,
        is_active: false,
      };

      // Act
      const presenter = await controller.create(input);

      // Assert
      expect(presenter.description).toBeNull();
      expect(presenter.is_active).toBe(false);

      // Verify persistence
      const found = await CategoryModel.findByPk(presenter.id);
      expect(found?.description).toBeNull();
      expect(found?.is_active).toBe(false);
    });

    it('should create multiple categories', async () => {
      // Arrange
      const inputs: CreateCategoryDto[] = [
        { name: 'Action', description: 'Action movies' },
        { name: 'Comedy', description: 'Comedy movies' },
        { name: 'Drama', description: 'Drama movies' },
      ];

      // Act
      const presenters = await Promise.all(
        inputs.map((input) => controller.create(input)),
      );

      // Assert
      expect(presenters).toHaveLength(3);
      presenters.forEach((presenter, index) => {
        expect(presenter.name).toBe(inputs[index].name);
        expect(presenter.description).toBe(inputs[index].description);
      });

      // Verify persistence
      const count = await CategoryModel.count();
      expect(count).toBe(3);
    });
  });

  describe('[update]', () => {
    it('should update a category', async () => {
      // Arrange
      const createInput: CreateCategoryDto = {
        name: 'Movie',
        description: 'some description',
        is_active: true,
      };
      const created = await controller.create(createInput);

      const updateInput: UpdateCategoryDto = {
        name: 'Updated Movie',
        description: 'updated description',
        is_active: false,
      };

      // Act
      const presenter = await controller.update(created.id, updateInput);

      // Assert
      expect(presenter).toBeInstanceOf(CategoriesPresenter);
      expect(presenter.id).toBe(created.id);
      expect(presenter.name).toBe(updateInput.name);
      expect(presenter.description).toBe(updateInput.description);
      expect(presenter.is_active).toBe(updateInput.is_active);

      // Verify persistence
      const found = await CategoryModel.findByPk(created.id);
      expect(found?.name).toBe(updateInput.name);
      expect(found?.description).toBe(updateInput.description);
      expect(found?.is_active).toBe(updateInput.is_active);
    });

    it('should update a category with partial data', async () => {
      // Arrange
      const createInput: CreateCategoryDto = {
        name: 'Original Name',
        description: 'Original description',
        is_active: true,
      };
      const created = await controller.create(createInput);

      const updateInput: UpdateCategoryDto = {
        name: 'Updated Name',
      };

      // Act
      const presenter = await controller.update(created.id, updateInput);

      // Assert
      expect(presenter.name).toBe('Updated Name');
      expect(presenter.description).toBe('Original description');
      expect(presenter.is_active).toBe(true);

      // Verify persistence
      const found = await CategoryModel.findByPk(created.id);
      expect(found?.name).toBe('Updated Name');
      expect(found?.description).toBe('Original description');
    });

    it('should update only is_active field', async () => {
      // Arrange
      const createInput: CreateCategoryDto = {
        name: 'Test Category',
        description: 'Test description',
        is_active: true,
      };
      const created = await controller.create(createInput);

      const updateInput: UpdateCategoryDto = {
        is_active: false,
      };

      // Act
      const presenter = await controller.update(created.id, updateInput);

      // Assert
      expect(presenter.name).toBe('Test Category');
      expect(presenter.is_active).toBe(false);

      // Verify persistence
      const found = await CategoryModel.findByPk(created.id);
      expect(found?.is_active).toBe(false);
    });

    it('should update description to null', async () => {
      // Arrange
      const createInput: CreateCategoryDto = {
        name: 'Test Category',
        description: 'Original description',
        is_active: true,
      };
      const created = await controller.create(createInput);

      const updateInput: UpdateCategoryDto = {
        description: null,
      };

      // Act
      const presenter = await controller.update(created.id, updateInput);

      // Assert
      expect(presenter.description).toBeNull();

      // Verify persistence
      const found = await CategoryModel.findByPk(created.id);
      expect(found?.description).toBeNull();
    });
  });

  describe('[remove]', () => {
    it('should delete a category', async () => {
      // Arrange
      const createInput: CreateCategoryDto = {
        name: 'To Delete',
        description: 'Will be deleted',
        is_active: true,
      };
      const created = await controller.create(createInput);

      // Verify it exists
      const beforeDelete = await CategoryModel.findByPk(created.id);
      expect(beforeDelete).not.toBeNull();

      // Act
      await controller.remove(created.id);

      // Assert
      const afterDelete = await CategoryModel.findByPk(created.id);
      expect(afterDelete).toBeNull();
    });

    it('should delete multiple categories', async () => {
      // Arrange
      const createInputs: CreateCategoryDto[] = [
        { name: 'Category 1' },
        { name: 'Category 2' },
        { name: 'Category 3' },
      ];
      const created = await Promise.all(
        createInputs.map((input) => controller.create(input)),
      );

      // Verify they exist
      const countBefore = await CategoryModel.count();
      expect(countBefore).toBe(3);

      // Act
      await Promise.all(created.map((cat) => controller.remove(cat.id)));

      // Assert
      const countAfter = await CategoryModel.count();
      expect(countAfter).toBe(0);
    });
  });

  describe('[findOne]', () => {
    it('should get a category', async () => {
      // Arrange
      const createInput: CreateCategoryDto = {
        name: 'Movie',
        description: 'some description',
        is_active: true,
      };
      const created = await controller.create(createInput);

      // Act
      const presenter = await controller.findOne(created.id);

      // Assert
      expect(presenter).toBeInstanceOf(CategoriesPresenter);
      expect(presenter.id).toBe(created.id);
      expect(presenter.name).toBe(createInput.name);
      expect(presenter.description).toBe(createInput.description);
      expect(presenter.is_active).toBe(createInput.is_active);
    });

    it('should get a category with null description', async () => {
      // Arrange
      const createInput: CreateCategoryDto = {
        name: 'Series',
        description: null,
        is_active: false,
      };
      const created = await controller.create(createInput);

      // Act
      const presenter = await controller.findOne(created.id);

      // Assert
      expect(presenter.description).toBeNull();
      expect(presenter.is_active).toBe(false);
    });

    it('should get multiple different categories', async () => {
      // Arrange
      const createInputs: CreateCategoryDto[] = [
        { name: 'Action', description: 'Action category' },
        { name: 'Comedy', description: 'Comedy category' },
        { name: 'Drama', description: null },
      ];
      const created = await Promise.all(
        createInputs.map((input) => controller.create(input)),
      );

      // Act
      const found = await Promise.all(
        created.map((cat) => controller.findOne(cat.id)),
      );

      // Assert
      expect(found).toHaveLength(3);
      found.forEach((presenter, index) => {
        expect(presenter.name).toBe(createInputs[index].name);
        expect(presenter.description).toBe(createInputs[index].description);
      });
    });
  });

  describe('[search]', () => {
    it('should list categories', async () => {
      // Arrange
      const createInputs: CreateCategoryDto[] = [
        { name: 'Action', description: 'Action movies' },
        { name: 'Comedy', description: 'Comedy movies' },
        { name: 'Drama', description: 'Drama movies' },
      ];
      await Promise.all(createInputs.map((input) => controller.create(input)));

      const searchParams: SearchCategoryDto = {
        page: 1,
        per_page: 10,
      };

      // Act
      const presenter = await controller.search(searchParams);

      // Assert
      expect(presenter).toBeInstanceOf(CategoriesCollectionPresenter);
      expect(presenter.data).toHaveLength(3);
      expect(presenter.meta.total).toBe(3);
      expect(presenter.meta.current_page).toBe(1);
    });

    it('should list categories with pagination', async () => {
      // Arrange
      const createInputs: CreateCategoryDto[] = Array.from(
        { length: 15 },
        (_, i) => ({ name: `Category ${i + 1}` }),
      );
      await Promise.all(createInputs.map((input) => controller.create(input)));

      const searchParams: SearchCategoryDto = {
        page: 1,
        per_page: 5,
      };

      // Act
      const presenter = await controller.search(searchParams);

      // Assert
      expect(presenter.data).toHaveLength(5);
      expect(presenter.meta.total).toBe(15);
      expect(presenter.meta.current_page).toBe(1);
      expect(presenter.meta.per_page).toBe(5);
      expect(presenter.meta.last_page).toBe(3);
    });

    it('should list categories on second page', async () => {
      // Arrange
      const createInputs: CreateCategoryDto[] = Array.from(
        { length: 10 },
        (_, i) => ({ name: `Category ${i + 1}` }),
      );
      await Promise.all(createInputs.map((input) => controller.create(input)));

      const searchParams: SearchCategoryDto = {
        page: 2,
        per_page: 3,
      };

      // Act
      const presenter = await controller.search(searchParams);

      // Assert
      expect(presenter.data).toHaveLength(3);
      expect(presenter.meta.current_page).toBe(2);
      expect(presenter.meta.total).toBe(10);
    });

    it('should list categories with sorting', async () => {
      // Arrange
      const createInputs: CreateCategoryDto[] = [
        { name: 'Zebra' },
        { name: 'Alpha' },
        { name: 'Beta' },
      ];
      await Promise.all(createInputs.map((input) => controller.create(input)));

      const searchParams: SearchCategoryDto = {
        page: 1,
        per_page: 10,
        sort: 'name',
        sort_dir: 'asc' as SortDirection,
      };

      // Act
      const presenter = await controller.search(searchParams);

      // Assert
      expect(presenter.data).toHaveLength(3);
      expect(presenter.data[0].name).toBe('Alpha');
      expect(presenter.data[1].name).toBe('Beta');
      expect(presenter.data[2].name).toBe('Zebra');
    });

    it('should list categories with descending sort', async () => {
      // Arrange
      const createInputs: CreateCategoryDto[] = [
        { name: 'Alpha' },
        { name: 'Beta' },
        { name: 'Zebra' },
      ];
      await Promise.all(createInputs.map((input) => controller.create(input)));

      const searchParams: SearchCategoryDto = {
        page: 1,
        per_page: 10,
        sort: 'name',
        sort_dir: 'desc' as SortDirection,
      };

      // Act
      const presenter = await controller.search(searchParams);

      // Assert
      expect(presenter.data).toHaveLength(3);
      expect(presenter.data[0].name).toBe('Zebra');
      expect(presenter.data[1].name).toBe('Beta');
      expect(presenter.data[2].name).toBe('Alpha');
    });

    it('should list categories with filter', async () => {
      // Arrange
      const createInputs: CreateCategoryDto[] = [
        { name: 'Action Movie' },
        { name: 'Comedy Movie' },
        { name: 'Action Series' },
        { name: 'Drama Movie' },
      ];
      await Promise.all(createInputs.map((input) => controller.create(input)));

      const searchParams: SearchCategoryDto = {
        page: 1,
        per_page: 10,
        filter: 'Action',
      };

      // Act
      const presenter = await controller.search(searchParams);

      // Assert
      expect(presenter.data.length).toBeGreaterThan(0);
      presenter.data.forEach((item) => {
        expect(item.name.toLowerCase()).toContain('action');
      });
    });

    it('should list categories with empty result', async () => {
      // Arrange
      const searchParams: SearchCategoryDto = {
        page: 1,
        per_page: 10,
        filter: 'NonExistent',
      };

      // Act
      const presenter = await controller.search(searchParams);

      // Assert
      expect(presenter).toBeInstanceOf(CategoriesCollectionPresenter);
      expect(presenter.data).toHaveLength(0);
      expect(presenter.meta.total).toBe(0);
    });

    it('should list categories without search params', async () => {
      // Arrange
      const createInputs: CreateCategoryDto[] = [
        { name: 'Category 1' },
        { name: 'Category 2' },
      ];
      await Promise.all(createInputs.map((input) => controller.create(input)));

      const searchParams: SearchCategoryDto = {};

      // Act
      const presenter = await controller.search(searchParams);

      // Assert
      expect(presenter.data.length).toBeGreaterThanOrEqual(0);
      expect(presenter).toBeInstanceOf(CategoriesCollectionPresenter);
    });
  });

  describe('[integration flow]', () => {
    it('should perform complete CRUD operations', async () => {
      // Create
      const createInput: CreateCategoryDto = {
        name: 'Test Category',
        description: 'Test description',
        is_active: true,
      };
      const created = await controller.create(createInput);
      expect(created).toBeInstanceOf(CategoriesPresenter);

      // Read
      const found = await controller.findOne(created.id);
      expect(found.name).toBe('Test Category');

      // Update
      const updateInput: UpdateCategoryDto = {
        name: 'Updated Category',
        is_active: false,
      };
      const updated = await controller.update(created.id, updateInput);
      expect(updated.name).toBe('Updated Category');
      expect(updated.is_active).toBe(false);

      // List
      const listResult = await controller.search({ page: 1, per_page: 10 });
      expect(listResult.data.length).toBeGreaterThan(0);
      const foundInList = listResult.data.find(
        (item) => item.id === created.id,
      );
      expect(foundInList).toBeDefined();
      expect(foundInList?.name).toBe('Updated Category');

      // Delete
      await controller.remove(created.id);
      const afterDelete = await CategoryModel.findByPk(created.id);
      expect(afterDelete).toBeNull();
    });

    it('should handle multiple categories with different operations', async () => {
      // Create multiple
      const categories = await Promise.all([
        controller.create({ name: 'Category A' }),
        controller.create({ name: 'Category B' }),
        controller.create({ name: 'Category C' }),
      ]);

      // Update one
      const updated = await controller.update(categories[0].id, {
        name: 'Updated Category A',
      });
      expect(updated.name).toBe('Updated Category A');

      // List all
      const list = await controller.search({ page: 1, per_page: 10 });
      expect(list.data.length).toBe(3);

      // Delete one
      await controller.remove(categories[1].id);

      // Verify deletion
      const listAfterDelete = await controller.search({
        page: 1,
        per_page: 10,
      });
      expect(listAfterDelete.data.length).toBe(2);
      const deletedExists = listAfterDelete.data.find(
        (item) => item.id === categories[1].id,
      );
      expect(deletedExists).toBeUndefined();
    });
  });
});
