import { CategoryInMemoryRepository } from '@/category/infra/db/in-memory/category-in-memory.repository';
import {
  DeleteCategoryUseCase,
  type DeleteCategoryInput,
} from '@/category/application/use-cases/delete-category/delete-category.use-case';
import { Category } from '@/category/domain/entities/category.entity';
import { NotFoundError } from '@/shared/domain/errors/not-found.error';
import { Uuid } from '@/shared/domain/value-objects/uuid.vo';

describe('Unit: [DeleteCategoryUseCase]', () => {
  let useCase: DeleteCategoryUseCase;
  let repository: CategoryInMemoryRepository;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    useCase = new DeleteCategoryUseCase(repository);
  });

  describe('[execute]', () => {
    it('should delete a category and call repository.delete', async () => {
      // Arrange
      const existingCategory = Category.fake()
        .createCategory()
        .withName('Category to Delete')
        .withDescription('Description')
        .activate()
        .build();
      await repository.insert(existingCategory);

      const input: DeleteCategoryInput = {
        id: existingCategory.id.value,
      };
      const deleteSpy = jest.spyOn(repository, 'delete');

      // Act
      await useCase.execute(input);

      // Assert
      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(deleteSpy).toHaveBeenCalledWith(expect.any(Uuid));
      const calledUuid = deleteSpy.mock.calls[0][0];
      expect(calledUuid.value).toBe(existingCategory.id.value);
    });

    it('should delete a category and verify it is removed from repository', async () => {
      // Arrange
      const existingCategory = Category.fake()
        .createCategory()
        .withName('Category to Delete')
        .build();
      await repository.insert(existingCategory);

      const input: DeleteCategoryInput = {
        id: existingCategory.id.value,
      };

      // Act
      await useCase.execute(input);

      // Assert
      const found = await repository.findById(existingCategory.id);
      expect(found).toBeNull();
      const all = await repository.findAll();
      expect(all).toHaveLength(0);
    });

    it('should delete only the specified category when multiple exist', async () => {
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

      const input: DeleteCategoryInput = {
        id: category2.id.value,
      };
      const deleteSpy = jest.spyOn(repository, 'delete');

      // Act
      await useCase.execute(input);

      // Assert
      expect(deleteSpy).toHaveBeenCalledTimes(1);
      const all = await repository.findAll();
      expect(all).toHaveLength(2);
      expect(
        all.find((c) => c.id.value === category2.id.value),
      ).toBeUndefined();
      expect(all.find((c) => c.id.value === category1.id.value)).toBeDefined();
      expect(all.find((c) => c.id.value === category3.id.value)).toBeDefined();
    });

    it('should throw NotFoundError when category does not exist', async () => {
      // Arrange
      const nonExistentId = new Uuid().value;
      const input: DeleteCategoryInput = {
        id: nonExistentId,
      };
      const deleteSpy = jest.spyOn(repository, 'delete');

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(NotFoundError);
      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(deleteSpy).toHaveBeenCalledWith(expect.any(Uuid));
    });

    it('should verify the Uuid passed to delete has correct value', async () => {
      // Arrange
      const existingCategory = Category.fake()
        .createCategory()
        .withName('Category to Delete')
        .build();
      await repository.insert(existingCategory);

      const input: DeleteCategoryInput = {
        id: existingCategory.id.value,
      };
      const deleteSpy = jest.spyOn(repository, 'delete');

      // Act
      await useCase.execute(input);

      // Assert
      expect(deleteSpy).toHaveBeenCalledTimes(1);
      const calledUuid = deleteSpy.mock.calls[0][0];
      expect(calledUuid).toBeInstanceOf(Uuid);
      expect(calledUuid.value).toBe(existingCategory.id.value);
      expect(calledUuid.value).toBe(input.id);
    });

    it('should delete category with different states (active/inactive)', async () => {
      // Arrange
      const activeCategory = Category.fake()
        .createCategory()
        .withName('Active Category')
        .activate()
        .build();
      const inactiveCategory = Category.fake()
        .createCategory()
        .withName('Inactive Category')
        .deactivate()
        .build();
      await repository.insert(activeCategory);
      await repository.insert(inactiveCategory);

      const input1: DeleteCategoryInput = {
        id: activeCategory.id.value,
      };
      const input2: DeleteCategoryInput = {
        id: inactiveCategory.id.value,
      };

      // Act
      await useCase.execute(input1);
      await useCase.execute(input2);

      // Assert
      const all = await repository.findAll();
      expect(all).toHaveLength(0);
      expect(await repository.findById(activeCategory.id)).toBeNull();
      expect(await repository.findById(inactiveCategory.id)).toBeNull();
    });
  });
});
