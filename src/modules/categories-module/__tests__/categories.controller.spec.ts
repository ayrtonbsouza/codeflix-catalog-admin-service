import type { SortDirection } from '@core/shared/domain/repositories/search-params';
import type { CategoryOutput } from '@core/category/application/use-cases/common/category-output';
import type { CreateCategoryOutput } from '@core/category/application/use-cases/create-category/create-category.use-case';
import type { UpdateCategoryOutput } from '@core/category/application/use-cases/update-category/update-category.use-case';
import type { GetCategoryOutput } from '@core/category/application/use-cases/get-category/get-category.use-case';
import type { ListCategoriesOutput } from '@core/category/application/use-cases/list-category/list-categories.use-case';
import { CategoriesController } from '@modules/categories-module/categories.controller';
import {
  CategoriesCollectionPresenter,
  CategoriesPresenter,
} from '@modules/categories-module/categories.presenter';
import type { CreateCategoryDto } from '@modules/categories-module/dto/create-category.dto';
import type { UpdateCategoryDto } from '@modules/categories-module/dto/update-category.dto';
import type { SearchCategoryDto } from '@modules/categories-module/dto/search-category.dto';

describe('Unit: [CategoriesController]', () => {
  let controller: CategoriesController;

  beforeEach(() => {
    controller = new CategoriesController();
  });

  describe('[create]', () => {
    it('should creates a category', async () => {
      // Arrange
      const output: CreateCategoryOutput = {
        id: '9366b7dc-2d71-4799-b91c-c64adb205104',
        name: 'Movie',
        description: 'some description',
        is_active: true,
        created_at: new Date(),
      };
      const mockCreateUseCase = {
        execute: jest.fn().mockReturnValue(Promise.resolve(output)),
      };
      // @ts-expect-error defined part of methods
      controller['createCategoryUseCase'] = mockCreateUseCase;
      const input: CreateCategoryDto = {
        name: 'Movie',
        description: 'some description',
        is_active: true,
      };

      // Act
      const presenter = await controller.create(input);

      // Assert
      expect(mockCreateUseCase.execute).toHaveBeenCalledWith(input);
      expect(mockCreateUseCase.execute).toHaveBeenCalledTimes(1);
      expect(presenter).toBeInstanceOf(CategoriesPresenter);
      expect(presenter).toStrictEqual(new CategoriesPresenter(output));
    });

    it('should creates a category with minimal data', async () => {
      // Arrange
      const output: CreateCategoryOutput = {
        id: '9366b7dc-2d71-4799-b91c-c64adb205104',
        name: 'Movie',
        description: null,
        is_active: true,
        created_at: new Date(),
      };
      const mockCreateUseCase = {
        execute: jest.fn().mockReturnValue(Promise.resolve(output)),
      };
      // @ts-expect-error defined part of methods
      controller['createCategoryUseCase'] = mockCreateUseCase;
      const input: CreateCategoryDto = {
        name: 'Movie',
      };

      // Act
      const presenter = await controller.create(input);

      // Assert
      expect(mockCreateUseCase.execute).toHaveBeenCalledWith(input);
      expect(presenter).toBeInstanceOf(CategoriesPresenter);
      expect(presenter.name).toBe('Movie');
      expect(presenter.description).toBeNull();
    });

    it('should creates a category with null description', async () => {
      // Arrange
      const output: CreateCategoryOutput = {
        id: '9366b7dc-2d71-4799-b91c-c64adb205104',
        name: 'Movie',
        description: null,
        is_active: false,
        created_at: new Date(),
      };
      const mockCreateUseCase = {
        execute: jest.fn().mockReturnValue(Promise.resolve(output)),
      };
      // @ts-expect-error defined part of methods
      controller['createCategoryUseCase'] = mockCreateUseCase;
      const input: CreateCategoryDto = {
        name: 'Movie',
        description: null,
        is_active: false,
      };

      // Act
      const presenter = await controller.create(input);

      // Assert
      expect(mockCreateUseCase.execute).toHaveBeenCalledWith(input);
      expect(presenter.description).toBeNull();
      expect(presenter.is_active).toBe(false);
    });

    it('should return CategoriesPresenter instance', async () => {
      // Arrange
      const output: CreateCategoryOutput = {
        id: '9366b7dc-2d71-4799-b91c-c64adb205104',
        name: 'Series',
        description: 'TV series category',
        is_active: true,
        created_at: new Date('2024-01-01'),
      };
      const mockCreateUseCase = {
        execute: jest.fn().mockReturnValue(Promise.resolve(output)),
      };
      // @ts-expect-error defined part of methods
      controller['createCategoryUseCase'] = mockCreateUseCase;
      const input: CreateCategoryDto = {
        name: 'Series',
        description: 'TV series category',
        is_active: true,
      };

      // Act
      const presenter = await controller.create(input);

      // Assert
      expect(presenter).toBeInstanceOf(CategoriesPresenter);
      expect(presenter.id).toBe(output.id);
      expect(presenter.name).toBe(output.name);
      expect(presenter.description).toBe(output.description);
      expect(presenter.is_active).toBe(output.is_active);
      expect(presenter.created_at).toBe(output.created_at);
    });
  });

  describe('[update]', () => {
    it('should updates a category', async () => {
      // Arrange
      const id = '9366b7dc-2d71-4799-b91c-c64adb205104';
      const output: UpdateCategoryOutput = {
        id,
        name: 'Movie',
        description: 'some description',
        is_active: true,
        created_at: new Date(),
      };
      const mockUpdateUseCase = {
        execute: jest.fn().mockReturnValue(Promise.resolve(output)),
      };
      // @ts-expect-error defined part of methods
      controller['updateCategoryUseCase'] = mockUpdateUseCase;
      const input: UpdateCategoryDto = {
        name: 'Movie',
        description: 'some description',
        is_active: true,
      };

      // Act
      const presenter = await controller.update(id, input);

      // Assert
      expect(mockUpdateUseCase.execute).toHaveBeenCalledWith({ id, ...input });
      expect(mockUpdateUseCase.execute).toHaveBeenCalledTimes(1);
      expect(presenter).toBeInstanceOf(CategoriesPresenter);
      expect(presenter).toStrictEqual(new CategoriesPresenter(output));
    });

    it('should updates a category with partial data', async () => {
      // Arrange
      const id = '9366b7dc-2d71-4799-b91c-c64adb205104';
      const output: UpdateCategoryOutput = {
        id,
        name: 'Updated Movie',
        description: 'some description',
        is_active: true,
        created_at: new Date(),
      };
      const mockUpdateUseCase = {
        execute: jest.fn().mockReturnValue(Promise.resolve(output)),
      };
      // @ts-expect-error defined part of methods
      controller['updateCategoryUseCase'] = mockUpdateUseCase;
      const input: UpdateCategoryDto = {
        name: 'Updated Movie',
      };

      // Act
      const presenter = await controller.update(id, input);

      // Assert
      expect(mockUpdateUseCase.execute).toHaveBeenCalledWith({ id, ...input });
      expect(presenter.name).toBe('Updated Movie');
    });

    it('should updates only is_active field', async () => {
      // Arrange
      const id = '9366b7dc-2d71-4799-b91c-c64adb205104';
      const output: UpdateCategoryOutput = {
        id,
        name: 'Movie',
        description: 'some description',
        is_active: false,
        created_at: new Date(),
      };
      const mockUpdateUseCase = {
        execute: jest.fn().mockReturnValue(Promise.resolve(output)),
      };
      // @ts-expect-error defined part of methods
      controller['updateCategoryUseCase'] = mockUpdateUseCase;
      const input: UpdateCategoryDto = {
        is_active: false,
      };

      // Act
      const presenter = await controller.update(id, input);

      // Assert
      expect(mockUpdateUseCase.execute).toHaveBeenCalledWith({ id, ...input });
      expect(presenter.is_active).toBe(false);
    });

    it('should updates description to null', async () => {
      // Arrange
      const id = '9366b7dc-2d71-4799-b91c-c64adb205104';
      const output: UpdateCategoryOutput = {
        id,
        name: 'Movie',
        description: null,
        is_active: true,
        created_at: new Date(),
      };
      const mockUpdateUseCase = {
        execute: jest.fn().mockReturnValue(Promise.resolve(output)),
      };
      // @ts-expect-error defined part of methods
      controller['updateCategoryUseCase'] = mockUpdateUseCase;
      const input: UpdateCategoryDto = {
        description: null,
      };

      // Act
      const presenter = await controller.update(id, input);

      // Assert
      expect(mockUpdateUseCase.execute).toHaveBeenCalledWith({ id, ...input });
      expect(presenter.description).toBeNull();
    });

    it('should return CategoriesPresenter instance', async () => {
      // Arrange
      const id = '9366b7dc-2d71-4799-b91c-c64adb205104';
      const output: UpdateCategoryOutput = {
        id,
        name: 'Updated Category',
        description: 'Updated description',
        is_active: false,
        created_at: new Date('2024-01-01'),
      };
      const mockUpdateUseCase = {
        execute: jest.fn().mockReturnValue(Promise.resolve(output)),
      };
      // @ts-expect-error defined part of methods
      controller['updateCategoryUseCase'] = mockUpdateUseCase;
      const input: UpdateCategoryDto = {
        name: 'Updated Category',
        description: 'Updated description',
        is_active: false,
      };

      // Act
      const presenter = await controller.update(id, input);

      // Assert
      expect(presenter).toBeInstanceOf(CategoriesPresenter);
      expect(presenter.id).toBe(id);
      expect(presenter.name).toBe(output.name);
    });
  });

  describe('[remove]', () => {
    it('should deletes a category', async () => {
      // Arrange
      const expectedOutput = undefined;
      const mockDeleteUseCase = {
        execute: jest.fn().mockReturnValue(Promise.resolve(expectedOutput)),
      };
      // @ts-expect-error defined part of methods
      controller['deleteCategoryUseCase'] = mockDeleteUseCase;
      const id = '9366b7dc-2d71-4799-b91c-c64adb205104';

      // Act
      const output = await controller.remove(id);

      // Assert
      expect(mockDeleteUseCase.execute).toHaveBeenCalledWith({ id });
      expect(mockDeleteUseCase.execute).toHaveBeenCalledTimes(1);
      expect(expectedOutput).toStrictEqual(output);
    });

    it('should return a promise when called', () => {
      // Arrange
      const mockDeleteUseCase = {
        execute: jest.fn().mockReturnValue(Promise.resolve(undefined)),
      };
      // @ts-expect-error defined part of methods
      controller['deleteCategoryUseCase'] = mockDeleteUseCase;
      const id = '9366b7dc-2d71-4799-b91c-c64adb205104';

      // Act & Assert
      const result = controller.remove(id);
      expect(result).toBeInstanceOf(Promise);
    });

    it('should call delete use case with correct id', async () => {
      // Arrange
      const mockDeleteUseCase = {
        execute: jest.fn().mockReturnValue(Promise.resolve(undefined)),
      };
      // @ts-expect-error defined part of methods
      controller['deleteCategoryUseCase'] = mockDeleteUseCase;
      const id = '550e8400-e29b-41d4-a716-446655440000';

      // Act
      await controller.remove(id);

      // Assert
      expect(mockDeleteUseCase.execute).toHaveBeenCalledWith({ id });
      expect(mockDeleteUseCase.execute).toHaveBeenCalledTimes(1);
    });
  });

  describe('[findOne]', () => {
    it('should gets a category', async () => {
      // Arrange
      const id = '9366b7dc-2d71-4799-b91c-c64adb205104';
      const output: GetCategoryOutput = {
        id,
        name: 'Movie',
        description: 'some description',
        is_active: true,
        created_at: new Date(),
      };
      const mockGetUseCase = {
        execute: jest.fn().mockReturnValue(Promise.resolve(output)),
      };
      // @ts-expect-error defined part of methods
      controller['getCategoryUseCase'] = mockGetUseCase;

      // Act
      const presenter = await controller.findOne(id);

      // Assert
      expect(mockGetUseCase.execute).toHaveBeenCalledWith({ id });
      expect(mockGetUseCase.execute).toHaveBeenCalledTimes(1);
      expect(presenter).toBeInstanceOf(CategoriesPresenter);
      expect(presenter).toStrictEqual(new CategoriesPresenter(output));
    });

    it('should return CategoriesPresenter with correct data', async () => {
      // Arrange
      const id = '9366b7dc-2d71-4799-b91c-c64adb205104';
      const output: GetCategoryOutput = {
        id,
        name: 'Series',
        description: null,
        is_active: false,
        created_at: new Date('2024-01-01'),
      };
      const mockGetUseCase = {
        execute: jest.fn().mockReturnValue(Promise.resolve(output)),
      };
      // @ts-expect-error defined part of methods
      controller['getCategoryUseCase'] = mockGetUseCase;

      // Act
      const presenter = await controller.findOne(id);

      // Assert
      expect(presenter).toBeInstanceOf(CategoriesPresenter);
      expect(presenter.id).toBe(id);
      expect(presenter.name).toBe('Series');
      expect(presenter.description).toBeNull();
      expect(presenter.is_active).toBe(false);
    });

    it('should call get use case with correct id parameter', async () => {
      // Arrange
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const output: GetCategoryOutput = {
        id,
        name: 'Test',
        description: 'Test description',
        is_active: true,
        created_at: new Date(),
      };
      const mockGetUseCase = {
        execute: jest.fn().mockReturnValue(Promise.resolve(output)),
      };
      // @ts-expect-error defined part of methods
      controller['getCategoryUseCase'] = mockGetUseCase;

      // Act
      await controller.findOne(id);

      // Assert
      expect(mockGetUseCase.execute).toHaveBeenCalledWith({ id });
      expect(mockGetUseCase.execute).toHaveBeenCalledTimes(1);
    });
  });

  describe('[search]', () => {
    it('should list categories', async () => {
      // Arrange
      const output: ListCategoriesOutput = {
        items: [
          {
            id: '9366b7dc-2d71-4799-b91c-c64adb205104',
            name: 'Movie',
            description: 'some description',
            is_active: true,
            created_at: new Date(),
          },
        ],
        current_page: 1,
        last_page: 1,
        per_page: 1,
        total: 1,
      };
      const mockListUseCase = {
        execute: jest.fn().mockReturnValue(Promise.resolve(output)),
      };
      // @ts-expect-error defined part of methods
      controller['listCategoriesUseCase'] = mockListUseCase;
      const searchParams: SearchCategoryDto = {
        page: 1,
        per_page: 2,
        sort: 'name',
        sort_dir: 'desc' as SortDirection,
        filter: 'test',
      };

      // Act
      const presenter = await controller.search(searchParams);

      // Assert
      expect(presenter).toBeInstanceOf(CategoriesCollectionPresenter);
      expect(mockListUseCase.execute).toHaveBeenCalledWith(searchParams);
      expect(mockListUseCase.execute).toHaveBeenCalledTimes(1);
      expect(presenter).toEqual(new CategoriesCollectionPresenter(output));
    });

    it('should list categories with empty result', async () => {
      // Arrange
      const output: ListCategoriesOutput = {
        items: [],
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
      };
      const mockListUseCase = {
        execute: jest.fn().mockReturnValue(Promise.resolve(output)),
      };
      // @ts-expect-error defined part of methods
      controller['listCategoriesUseCase'] = mockListUseCase;
      const searchParams: SearchCategoryDto = {
        page: 1,
        per_page: 10,
      };

      // Act
      const presenter = await controller.search(searchParams);

      // Assert
      expect(presenter).toBeInstanceOf(CategoriesCollectionPresenter);
      expect(presenter.data).toHaveLength(0);
      expect(presenter.meta.total).toBe(0);
    });

    it('should list categories with multiple items', async () => {
      // Arrange
      const output: ListCategoriesOutput = {
        items: [
          {
            id: '9366b7dc-2d71-4799-b91c-c64adb205104',
            name: 'Movie',
            description: 'Movie category',
            is_active: true,
            created_at: new Date(),
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'Series',
            description: 'Series category',
            is_active: true,
            created_at: new Date(),
          },
        ],
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 2,
      };
      const mockListUseCase = {
        execute: jest.fn().mockReturnValue(Promise.resolve(output)),
      };
      // @ts-expect-error defined part of methods
      controller['listCategoriesUseCase'] = mockListUseCase;
      const searchParams: SearchCategoryDto = {
        page: 1,
        per_page: 10,
      };

      // Act
      const presenter = await controller.search(searchParams);

      // Assert
      expect(presenter).toBeInstanceOf(CategoriesCollectionPresenter);
      expect(presenter.data).toHaveLength(2);
      expect(presenter.data[0].name).toBe('Movie');
      expect(presenter.data[1].name).toBe('Series');
    });

    it('should list categories with pagination', async () => {
      // Arrange
      const output: ListCategoriesOutput = {
        items: [
          {
            id: '9366b7dc-2d71-4799-b91c-c64adb205104',
            name: 'Movie',
            description: 'some description',
            is_active: true,
            created_at: new Date(),
          },
        ],
        current_page: 2,
        last_page: 5,
        per_page: 10,
        total: 50,
      };
      const mockListUseCase = {
        execute: jest.fn().mockReturnValue(Promise.resolve(output)),
      };
      // @ts-expect-error defined part of methods
      controller['listCategoriesUseCase'] = mockListUseCase;
      const searchParams: SearchCategoryDto = {
        page: 2,
        per_page: 10,
        sort: 'name',
        sort_dir: 'asc' as SortDirection,
      };

      // Act
      const presenter = await controller.search(searchParams);

      // Assert
      expect(presenter).toBeInstanceOf(CategoriesCollectionPresenter);
      expect(presenter.meta.current_page).toBe(2);
      expect(presenter.meta.last_page).toBe(5);
      expect(presenter.meta.per_page).toBe(10);
      expect(presenter.meta.total).toBe(50);
    });

    it('should list categories with filter', async () => {
      // Arrange
      const output: ListCategoriesOutput = {
        items: [
          {
            id: '9366b7dc-2d71-4799-b91c-c64adb205104',
            name: 'Movie',
            description: 'some description',
            is_active: true,
            created_at: new Date(),
          },
        ],
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 1,
      };
      const mockListUseCase = {
        execute: jest.fn().mockReturnValue(Promise.resolve(output)),
      };
      // @ts-expect-error defined part of methods
      controller['listCategoriesUseCase'] = mockListUseCase;
      const searchParams: SearchCategoryDto = {
        filter: 'Movie',
      };

      // Act
      const presenter = await controller.search(searchParams);

      // Assert
      expect(mockListUseCase.execute).toHaveBeenCalledWith(searchParams);
      expect(presenter.data[0].name).toBe('Movie');
    });

    it('should list categories without search params', async () => {
      // Arrange
      const output: ListCategoriesOutput = {
        items: [],
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
      };
      const mockListUseCase = {
        execute: jest.fn().mockReturnValue(Promise.resolve(output)),
      };
      // @ts-expect-error defined part of methods
      controller['listCategoriesUseCase'] = mockListUseCase;
      const searchParams: SearchCategoryDto = {};

      // Act
      const presenter = await controller.search(searchParams);

      // Assert
      expect(mockListUseCase.execute).toHaveBeenCalledWith(searchParams);
      expect(presenter).toBeInstanceOf(CategoriesCollectionPresenter);
    });
  });

  describe('[serialize static method]', () => {
    it('should serialize CategoryOutput to CategoriesPresenter', () => {
      // Arrange
      const output: CategoryOutput = {
        id: '9366b7dc-2d71-4799-b91c-c64adb205104',
        name: 'Movie',
        description: 'some description',
        is_active: true,
        created_at: new Date(),
      };

      // Act
      const presenter = CategoriesController.serialize(output);

      // Assert
      expect(presenter).toBeInstanceOf(CategoriesPresenter);
      expect(presenter).toStrictEqual(new CategoriesPresenter(output));
    });

    it('should serialize CategoryOutput with null description', () => {
      // Arrange
      const output: CategoryOutput = {
        id: '9366b7dc-2d71-4799-b91c-c64adb205104',
        name: 'Movie',
        description: null,
        is_active: false,
        created_at: new Date(),
      };

      // Act
      const presenter = CategoriesController.serialize(output);

      // Assert
      expect(presenter).toBeInstanceOf(CategoriesPresenter);
      expect(presenter.description).toBeNull();
      expect(presenter.is_active).toBe(false);
    });
  });
});
