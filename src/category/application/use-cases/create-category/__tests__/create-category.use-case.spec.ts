import { CategoryInMemoryRepository } from '@/category/infra/db/in-memory/category-in-memory.repository';
import {
  CreateCategoryUseCase,
  type CreateCategoryInput,
} from '@/category/application/use-cases/create-category/create-category.use-case';
import { Category } from '@/category/domain/entities/category.entity';
import { EntityValidationError } from '@/shared/domain/validators/validation.error';

describe('Unit: [CreateCategoryUseCase]', () => {
  let useCase: CreateCategoryUseCase;
  let repository: CategoryInMemoryRepository;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    useCase = new CreateCategoryUseCase(repository);
  });

  describe('[execute]', () => {
    it('should create a category with all fields and call repository.insert', async () => {
      // Arrange
      const input: CreateCategoryInput = {
        name: 'Action',
        description: 'Action movies category',
        is_active: true,
      };
      const insertSpy = jest.spyOn(repository, 'insert');

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(insertSpy).toHaveBeenCalledTimes(1);
      expect(insertSpy).toHaveBeenCalledWith(expect.any(Category));
      expect(output).toMatchObject({
        name: input.name,
        description: input.description,
        is_active: input.is_active,
      });
      expect(output.id).toBeDefined();
      expect(output.created_at).toBeInstanceOf(Date);
    });

    it('should create a category with only required fields and call repository.insert', async () => {
      // Arrange
      const input: CreateCategoryInput = {
        name: 'Comedy',
      };
      const insertSpy = jest.spyOn(repository, 'insert');

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(insertSpy).toHaveBeenCalledTimes(1);
      expect(insertSpy).toHaveBeenCalledWith(expect.any(Category));
      expect(output).toMatchObject({
        name: input.name,
        description: null,
        is_active: true,
      });
      expect(output.id).toBeDefined();
      expect(output.created_at).toBeInstanceOf(Date);
    });

    it('should create a category with null description and call repository.insert', async () => {
      // Arrange
      const input: CreateCategoryInput = {
        name: 'Drama',
        description: null,
        is_active: false,
      };
      const insertSpy = jest.spyOn(repository, 'insert');

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(insertSpy).toHaveBeenCalledTimes(1);
      expect(insertSpy).toHaveBeenCalledWith(expect.any(Category));
      expect(output).toMatchObject({
        name: input.name,
        description: null,
        is_active: false,
      });
      expect(output.id).toBeDefined();
      expect(output.created_at).toBeInstanceOf(Date);
    });

    it('should create a category and verify the entity passed to insert has correct properties', async () => {
      // Arrange
      const input: CreateCategoryInput = {
        name: 'Horror',
        description: 'Horror movies',
        is_active: true,
      };
      const insertSpy = jest.spyOn(repository, 'insert');

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(insertSpy).toHaveBeenCalledTimes(1);
      const insertedEntity = insertSpy.mock.calls[0][0];
      expect(insertedEntity).toBeInstanceOf(Category);
      if (insertedEntity instanceof Category) {
        expect(insertedEntity.name).toBe(input.name);
        expect(insertedEntity.description).toBe(input.description);
        expect(insertedEntity.is_active).toBe(input.is_active);
        expect(output.id).toBe(insertedEntity.id.value);
        expect(output.name).toBe(insertedEntity.name);
        expect(output.description).toBe(insertedEntity.description);
        expect(output.is_active).toBe(insertedEntity.is_active);
        expect(output.created_at).toBe(insertedEntity.created_at);
      }
    });

    it('should throw EntityValidationError when category has validation errors', async () => {
      // Arrange
      const input: CreateCategoryInput = {
        name: '',
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(
        EntityValidationError,
      );

      try {
        await useCase.execute(input);
        fail('Expected EntityValidationError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(EntityValidationError);
        expect((error as EntityValidationError).error).toBeDefined();
        expect(Array.isArray((error as EntityValidationError).error)).toBe(
          true,
        );
      }
    });

    it('should throw EntityValidationError when category name is too short', async () => {
      // Arrange
      const input: CreateCategoryInput = {
        name: 'AB',
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(
        EntityValidationError,
      );

      try {
        await useCase.execute(input);
        fail('Expected EntityValidationError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(EntityValidationError);
        expect((error as EntityValidationError).error).toBeDefined();
        expect(Array.isArray((error as EntityValidationError).error)).toBe(
          true,
        );
      }
    });
  });
});
