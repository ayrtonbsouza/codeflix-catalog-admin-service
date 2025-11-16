import { CategoryInMemoryRepository } from '@core/category/infra/db/in-memory/category-in-memory.repository';
import {
  GetCategoryUseCase,
  type GetCategoryInput,
} from '@core/category/application/use-cases/get-category/get-category.use-case';
import { Category } from '@core/category/domain/entities/category.entity';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';

describe('Unit: [GetCategoryUseCase]', () => {
  let useCase: GetCategoryUseCase;
  let repository: CategoryInMemoryRepository;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    useCase = new GetCategoryUseCase(repository);
  });

  describe('[execute]', () => {
    it('should get a category with all fields and call repository.findById', async () => {
      // Arrange
      const existingCategory = Category.fake()
        .createCategory()
        .withName('Category Name')
        .withDescription('Category Description')
        .activate()
        .build();
      await repository.insert(existingCategory);

      const input: GetCategoryInput = {
        id: existingCategory.id.value,
      };
      const findByIdSpy = jest.spyOn(repository, 'findById');

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(findByIdSpy).toHaveBeenCalledTimes(1);
      expect(findByIdSpy).toHaveBeenCalledWith(expect.any(Uuid));
      expect(output).toMatchObject({
        id: existingCategory.id.value,
        name: existingCategory.name,
        description: existingCategory.description,
        is_active: existingCategory.is_active,
      });
      expect(output.created_at).toBeInstanceOf(Date);
      expect(output.created_at).toEqual(existingCategory.created_at);
    });

    it('should get a category with null description and call repository.findById', async () => {
      // Arrange
      const existingCategory = Category.fake()
        .createCategory()
        .withName('Category Name')
        .withDescription(null)
        .activate()
        .build();
      await repository.insert(existingCategory);

      const input: GetCategoryInput = {
        id: existingCategory.id.value,
      };
      const findByIdSpy = jest.spyOn(repository, 'findById');

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(findByIdSpy).toHaveBeenCalledTimes(1);
      expect(output).toMatchObject({
        id: existingCategory.id.value,
        name: existingCategory.name,
        description: null,
        is_active: existingCategory.is_active,
      });
    });

    it('should get an active category and call repository.findById', async () => {
      // Arrange
      const existingCategory = Category.fake()
        .createCategory()
        .withName('Active Category')
        .activate()
        .build();
      await repository.insert(existingCategory);

      const input: GetCategoryInput = {
        id: existingCategory.id.value,
      };
      const findByIdSpy = jest.spyOn(repository, 'findById');

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(findByIdSpy).toHaveBeenCalledTimes(1);
      expect(output).toMatchObject({
        id: existingCategory.id.value,
        name: existingCategory.name,
        is_active: true,
      });
    });

    it('should get an inactive category and call repository.findById', async () => {
      // Arrange
      const existingCategory = Category.fake()
        .createCategory()
        .withName('Inactive Category')
        .deactivate()
        .build();
      await repository.insert(existingCategory);

      const input: GetCategoryInput = {
        id: existingCategory.id.value,
      };
      const findByIdSpy = jest.spyOn(repository, 'findById');

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(findByIdSpy).toHaveBeenCalledTimes(1);
      expect(output).toMatchObject({
        id: existingCategory.id.value,
        name: existingCategory.name,
        is_active: false,
      });
    });

    it('should throw NotFoundError when category does not exist', async () => {
      // Arrange
      const nonExistentId = new Uuid().value;
      const input: GetCategoryInput = {
        id: nonExistentId,
      };
      const findByIdSpy = jest.spyOn(repository, 'findById');

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(NotFoundError);
      expect(findByIdSpy).toHaveBeenCalledTimes(1);
      expect(findByIdSpy).toHaveBeenCalledWith(expect.any(Uuid));
    });

    it('should verify the Uuid passed to findById has correct value', async () => {
      // Arrange
      const existingCategory = Category.fake()
        .createCategory()
        .withName('Category Name')
        .build();
      await repository.insert(existingCategory);

      const input: GetCategoryInput = {
        id: existingCategory.id.value,
      };
      const findByIdSpy = jest.spyOn(repository, 'findById');

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(findByIdSpy).toHaveBeenCalledTimes(1);
      const calledUuid = findByIdSpy.mock.calls[0][0];
      expect(calledUuid).toBeInstanceOf(Uuid);
      expect(calledUuid.value).toBe(existingCategory.id.value);
      expect(calledUuid.value).toBe(input.id);
      expect(output.id).toBe(existingCategory.id.value);
    });

    it('should return output with all category properties correctly mapped', async () => {
      // Arrange
      const existingCategory = Category.fake()
        .createCategory()
        .withName('Category Name')
        .withDescription('Category Description')
        .activate()
        .build();
      await repository.insert(existingCategory);

      const input: GetCategoryInput = {
        id: existingCategory.id.value,
      };

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(output.id).toBe(existingCategory.id.value);
      expect(output.name).toBe(existingCategory.name);
      expect(output.description).toBe(existingCategory.description);
      expect(output.is_active).toBe(existingCategory.is_active);
      expect(output.created_at).toEqual(existingCategory.created_at);
    });

    it('should get category when multiple categories exist', async () => {
      // Arrange
      const category1 = Category.fake()
        .createCategory()
        .withName('Category 1')
        .build();
      const category2 = Category.fake()
        .createCategory()
        .withName('Category 2')
        .build();
      const category3 = Category.fake()
        .createCategory()
        .withName('Category 3')
        .build();
      await repository.insert(category1);
      await repository.insert(category2);
      await repository.insert(category3);

      const input: GetCategoryInput = {
        id: category2.id.value,
      };

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(output.id).toBe(category2.id.value);
      expect(output.name).toBe(category2.name);
      expect(output.description).toBe(category2.description);
      expect(output.is_active).toBe(category2.is_active);
    });
  });
});
