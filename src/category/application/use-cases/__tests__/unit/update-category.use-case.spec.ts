import { CategoryInMemoryRepository } from '@/category/infra/db/in-memory/category-in-memory.repository';
import {
  UpdateCategoryUseCase,
  type UpdateCategoryInput,
} from '@/category/application/use-cases/update-category.use-case';
import { Category } from '@/category/domain/entities/category.entity';
import { NotFoundError } from '@/shared/domain/errors/not-found.error';
import { Uuid } from '@/shared/domain/value-objects/uuid.vo';
import { EntityValidationError } from '@/shared/domain/validators/validation.error';

describe('Unit: [UpdateCategoryUseCase]', () => {
  let useCase: UpdateCategoryUseCase;
  let repository: CategoryInMemoryRepository;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    useCase = new UpdateCategoryUseCase(repository);
  });

  describe('[execute]', () => {
    it('should update a category with all fields and call repository.update', async () => {
      // Arrange
      const existingCategory = Category.fake()
        .createCategory()
        .withName('Old Name')
        .withDescription('Old Description')
        .deactivate()
        .build();
      await repository.insert(existingCategory);

      const input: UpdateCategoryInput = {
        id: existingCategory.id.value,
        name: 'New Name',
        description: 'New Description',
        is_active: true,
      };
      const findByIdSpy = jest.spyOn(repository, 'findById');
      const updateSpy = jest.spyOn(repository, 'update');

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(findByIdSpy).toHaveBeenCalledTimes(1);
      expect(findByIdSpy).toHaveBeenCalledWith(existingCategory.id);
      expect(updateSpy).toHaveBeenCalledTimes(1);
      expect(updateSpy).toHaveBeenCalledWith(expect.any(Category));
      expect(output).toMatchObject({
        id: existingCategory.id.value,
        name: input.name,
        description: input.description,
        is_active: input.is_active,
      });
      expect(output.created_at).toBeInstanceOf(Date);
    });

    it('should update only the name and call repository.update', async () => {
      // Arrange
      const existingCategory = Category.fake()
        .createCategory()
        .withName('Old Name')
        .withDescription('Old Description')
        .activate()
        .build();
      await repository.insert(existingCategory);

      const input: UpdateCategoryInput = {
        id: existingCategory.id.value,
        name: 'Updated Name',
      };
      const updateSpy = jest.spyOn(repository, 'update');

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(updateSpy).toHaveBeenCalledTimes(1);
      expect(output).toMatchObject({
        id: existingCategory.id.value,
        name: input.name,
        description: existingCategory.description,
        is_active: existingCategory.is_active,
      });
      expect(output.created_at).toEqual(existingCategory.created_at);
    });

    it('should update only the description and call repository.update', async () => {
      // Arrange
      const existingCategory = Category.fake()
        .createCategory()
        .withName('Category Name')
        .withDescription('Old Description')
        .activate()
        .build();
      await repository.insert(existingCategory);

      const input: UpdateCategoryInput = {
        id: existingCategory.id.value,
        description: 'Updated Description',
      };
      const updateSpy = jest.spyOn(repository, 'update');

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(updateSpy).toHaveBeenCalledTimes(1);
      expect(output).toMatchObject({
        id: existingCategory.id.value,
        name: existingCategory.name,
        description: input.description,
        is_active: existingCategory.is_active,
      });
    });

    it('should activate category when is_active is true and call repository.update', async () => {
      // Arrange
      const existingCategory = Category.fake()
        .createCategory()
        .withName('Category Name')
        .deactivate()
        .build();
      await repository.insert(existingCategory);

      const input: UpdateCategoryInput = {
        id: existingCategory.id.value,
        is_active: true,
      };
      const updateSpy = jest.spyOn(repository, 'update');

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(updateSpy).toHaveBeenCalledTimes(1);
      expect(output).toMatchObject({
        id: existingCategory.id.value,
        name: existingCategory.name,
        description: existingCategory.description,
        is_active: true,
      });
    });

    it('should deactivate category when is_active is false and call repository.update', async () => {
      // Arrange
      const existingCategory = Category.fake()
        .createCategory()
        .withName('Category Name')
        .activate()
        .build();
      await repository.insert(existingCategory);

      const input: UpdateCategoryInput = {
        id: existingCategory.id.value,
        is_active: false,
      };
      const updateSpy = jest.spyOn(repository, 'update');

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(updateSpy).toHaveBeenCalledTimes(1);
      expect(output).toMatchObject({
        id: existingCategory.id.value,
        name: existingCategory.name,
        description: existingCategory.description,
        is_active: false,
      });
    });

    it('should update multiple fields and call repository.update', async () => {
      // Arrange
      const existingCategory = Category.fake()
        .createCategory()
        .withName('Old Name')
        .withDescription('Old Description')
        .deactivate()
        .build();
      await repository.insert(existingCategory);

      const input: UpdateCategoryInput = {
        id: existingCategory.id.value,
        name: 'New Name',
        description: 'New Description',
      };
      const updateSpy = jest.spyOn(repository, 'update');

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(updateSpy).toHaveBeenCalledTimes(1);
      expect(output).toMatchObject({
        id: existingCategory.id.value,
        name: input.name,
        description: input.description,
        is_active: existingCategory.is_active,
      });
    });

    it('should throw NotFoundError when category does not exist', async () => {
      // Arrange
      const nonExistentId = new Uuid().value;
      const input: UpdateCategoryInput = {
        id: nonExistentId,
        name: 'New Name',
      };
      const findByIdSpy = jest.spyOn(repository, 'findById');

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(NotFoundError);
      expect(findByIdSpy).toHaveBeenCalledTimes(1);
      expect(findByIdSpy).toHaveBeenCalledWith(expect.any(Uuid));
    });

    it('should verify the entity passed to update has correct properties', async () => {
      // Arrange
      const existingCategory = Category.fake()
        .createCategory()
        .withName('Old Name')
        .withDescription('Old Description')
        .deactivate()
        .build();
      await repository.insert(existingCategory);

      const input: UpdateCategoryInput = {
        id: existingCategory.id.value,
        name: 'Updated Name',
        description: 'Updated Description',
        is_active: true,
      };
      const updateSpy = jest.spyOn(repository, 'update');

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(updateSpy).toHaveBeenCalledTimes(1);
      const updatedEntity = updateSpy.mock.calls[0][0];
      expect(updatedEntity).toBeInstanceOf(Category);
      if (updatedEntity instanceof Category) {
        expect(updatedEntity.id.value).toBe(existingCategory.id.value);
        expect(updatedEntity.name).toBe(input.name);
        expect(updatedEntity.description).toBe(input.description);
        expect(updatedEntity.is_active).toBe(true);
        expect(output.id).toBe(updatedEntity.id.value);
        expect(output.name).toBe(updatedEntity.name);
        expect(output.description).toBe(updatedEntity.description);
        expect(output.is_active).toBe(updatedEntity.is_active);
        expect(output.created_at).toBe(updatedEntity.created_at);
      }
    });

    it('should not update fields when they are not provided in input', async () => {
      // Arrange
      const existingCategory = Category.fake()
        .createCategory()
        .withName('Category Name')
        .withDescription('Category Description')
        .activate()
        .build();
      await repository.insert(existingCategory);

      const input: UpdateCategoryInput = {
        id: existingCategory.id.value,
      };
      const updateSpy = jest.spyOn(repository, 'update');

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(updateSpy).toHaveBeenCalledTimes(1);
      expect(output).toMatchObject({
        id: existingCategory.id.value,
        name: existingCategory.name,
        description: existingCategory.description,
        is_active: existingCategory.is_active,
      });
    });

    it('should throw EntityValidationError when category has validation errors after changing name', async () => {
      // Arrange
      const existingCategory = Category.fake()
        .createCategory()
        .withName('Valid Name')
        .build();
      await repository.insert(existingCategory);

      const input: UpdateCategoryInput = {
        id: existingCategory.id.value,
        name: '',
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(EntityValidationError);

      try {
        await useCase.execute(input);
        fail('Expected EntityValidationError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(EntityValidationError);
        expect((error as EntityValidationError).error).toBeDefined();
        expect(Array.isArray((error as EntityValidationError).error)).toBe(true);
      }
    });

    it('should throw EntityValidationError when category name is too short after update', async () => {
      // Arrange
      const existingCategory = Category.fake()
        .createCategory()
        .withName('Valid Name')
        .build();
      await repository.insert(existingCategory);

      const input: UpdateCategoryInput = {
        id: existingCategory.id.value,
        name: 'AB',
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(EntityValidationError);

      try {
        await useCase.execute(input);
        fail('Expected EntityValidationError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(EntityValidationError);
        expect((error as EntityValidationError).error).toBeDefined();
        expect(Array.isArray((error as EntityValidationError).error)).toBe(true);
      }
    });
  });
});
