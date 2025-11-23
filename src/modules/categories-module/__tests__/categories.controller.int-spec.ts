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
import {
  CreateCategoryFixture,
  ListCategoriesFixture,
  UpdateCategoryFixture,
} from '@modules/categories-module/testing/category.fixture';
import { CategoryOutputMapper } from '@core/category/application/use-cases/common/category-output';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { Category } from '@core/category/domain/entities/category.entity';
import type { CreateCategoryDto } from '@modules/categories-module/dto/create-category.dto';
import type { UpdateCategoryDto } from '@modules/categories-module/dto/update-category.dto';
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
    const arrange = CreateCategoryFixture.arrangeForCreate();

    test.each(arrange)(
      'when body is $send_data',
      async ({ send_data, expected }) => {
        // Act
        const presenter = await controller.create(send_data);

        // Assert
        const entity = await repository.findById(new Uuid(presenter.id));
        expect(entity?.toJSON()).toStrictEqual({
          id: presenter.id,
          created_at: presenter.created_at,
          ...expected,
        });

        const output = CategoryOutputMapper.toOutput(entity);
        expect(presenter).toEqual(new CategoriesPresenter(output));
      },
    );
  });

  describe('[update]', () => {
    const arrange = UpdateCategoryFixture.arrangeForUpdate();

    test.each(arrange)(
      'when body is $send_data',
      async ({ send_data, expected }) => {
        // Arrange
        const category = Category.fake()
          .createCategory()
          .withName('Movie')
          .withDescription('description test')
          .build();
        await repository.insert(category);

        // Act
        const presenter = await controller.update(category.id.value, send_data);

        // Assert
        const entity = await repository.findById(new Uuid(presenter.id));
        expect(entity?.toJSON()).toStrictEqual({
          id: presenter.id,
          created_at: presenter.created_at,
          name: expected.name ?? category.name,
          description:
            'description' in expected
              ? expected.description
              : category.description,
          is_active:
            expected.is_active === true || expected.is_active === false
              ? expected.is_active
              : category.is_active,
        });

        const output = CategoryOutputMapper.toOutput(entity);
        expect(presenter).toEqual(new CategoriesPresenter(output));
      },
    );
  });

  describe('[remove]', () => {
    it('should delete a category', async () => {
      // Arrange
      const category = Category.fake().createCategory().build();
      await repository.insert(category);

      // Act
      const response = await controller.remove(category.id.value);

      // Assert
      expect(response).not.toBeDefined();
      await expect(repository.findById(category.id)).resolves.toBeNull();
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
      const category = Category.fake()
        .createCategory()
        .withName('Test Category')
        .build();
      await repository.insert(category);

      // Act
      const presenter = await controller.findOne(category.id.value);

      // Assert
      expect(presenter.id).toBe(category.id.value);
      expect(presenter.name).toBe(category.name);
      expect(presenter.description).toBe(category.description);
      expect(presenter.is_active).toBe(category.is_active);
      expect(presenter.created_at).toStrictEqual(category.created_at);
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
    describe('should sorted categories by created_at', () => {
      const { entitiesMap, arrange } =
        ListCategoriesFixture.arrangeIncrementedWithCreatedAt();

      beforeEach(async () => {
        await repository.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'when send_data is $send_data',
        async ({ send_data, expected }) => {
          // Act
          const presenter = await controller.search(send_data);

          // Assert
          const { entities, ...paginationProps } = expected;
          expect(presenter).toEqual(
            new CategoriesCollectionPresenter({
              items: entities.map(CategoryOutputMapper.toOutput),
              ...paginationProps.meta,
            }),
          );
        },
      );
    });

    describe('should return categories using pagination, sort and filter', () => {
      const { entitiesMap, arrange } = ListCategoriesFixture.arrangeUnsorted();

      beforeEach(async () => {
        await repository.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'when send_data is $send_data',
        async ({ send_data, expected }) => {
          // Act
          const presenter = await controller.search(send_data);

          // Assert
          const { entities, ...paginationProps } = expected;
          expect(presenter).toEqual(
            new CategoriesCollectionPresenter({
              items: entities.map(CategoryOutputMapper.toOutput),
              ...paginationProps.meta,
            }),
          );
        },
      );
    });

    it('should list categories', async () => {
      // Arrange
      const createInputs: CreateCategoryDto[] = [
        { name: 'Action', description: 'Action movies' },
        { name: 'Comedy', description: 'Comedy movies' },
        { name: 'Drama', description: 'Drama movies' },
      ];
      await Promise.all(createInputs.map((input) => controller.create(input)));

      const searchParams = {
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

      const searchParams = {
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

      const searchParams = {
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

    it('should list categories with empty result', async () => {
      // Arrange
      const searchParams = {
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

      const searchParams = {};

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
