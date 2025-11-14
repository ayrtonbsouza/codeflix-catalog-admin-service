import { CategorySequelizeRepository } from '@/category/infra/db/sequelize/repositories/category.sequelize.repository';
import {
  DeleteCategoryUseCase,
  type DeleteCategoryInput,
} from '@/category/application/use-cases/delete-category.use-case';
import { setupSequelize } from '@/shared/infra/testing/helpers';
import { CategoryModel } from '@/category/infra/db/sequelize/model/category.model';
import { Uuid } from '@/shared/domain/value-objects/uuid.vo';
import { Category } from '@/category/domain/entities/category.entity';
import { NotFoundError } from '@/shared/domain/errors/not-found.error';

describe('Integration: [DeleteCategoryUseCase]', () => {
  let useCase: DeleteCategoryUseCase;
  let repository: CategorySequelizeRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new CategorySequelizeRepository(CategoryModel);
    useCase = new DeleteCategoryUseCase(repository);
  });

  describe('[execute]', () => {
    it('should delete a category and persist in database', async () => {
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

      // Act
      await useCase.execute(input);

      // Assert
      const found = await CategoryModel.findByPk(existingCategory.id.value);
      expect(found).toBeNull();
      const foundInRepository = await repository.findById(existingCategory.id);
      expect(foundInRepository).toBeNull();
    });

    it('should delete only the specified category when multiple exist', async () => {
      // Arrange
      const category1 = Category.fake()
        .createCategory()
        .withName('Category 1')
        .withDescription('Description 1')
        .build();
      const category2 = Category.fake()
        .createCategory()
        .withName('Category 2')
        .withDescription('Description 2')
        .build();
      const category3 = Category.fake()
        .createCategory()
        .withName('Category 3')
        .withDescription('Description 3')
        .build();
      await repository.insert(category1);
      await repository.insert(category2);
      await repository.insert(category3);

      const input: DeleteCategoryInput = {
        id: category2.id.value,
      };

      // Act
      await useCase.execute(input);

      // Assert
      const allCategories = await CategoryModel.findAll();
      expect(allCategories).toHaveLength(2);
      expect(
        allCategories.find((c) => c.id === category2.id.value),
      ).toBeUndefined();
      expect(
        allCategories.find((c) => c.id === category1.id.value),
      ).toBeDefined();
      expect(
        allCategories.find((c) => c.id === category3.id.value),
      ).toBeDefined();

      const found1 = await repository.findById(category1.id);
      const found2 = await repository.findById(category2.id);
      const found3 = await repository.findById(category3.id);

      expect(found1).not.toBeNull();
      expect(found2).toBeNull();
      expect(found3).not.toBeNull();
    });

    it('should throw NotFoundError when category does not exist', async () => {
      // Arrange
      const nonExistentId = new Uuid().value;
      const input: DeleteCategoryInput = {
        id: nonExistentId,
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(NotFoundError);
    });

    it('should delete category and verify it cannot be retrieved by id', async () => {
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

      // Act
      await useCase.execute(input);

      // Assert
      const foundCategory = await repository.findById(existingCategory.id);
      expect(foundCategory).toBeNull();

      const foundModel = await CategoryModel.findByPk(
        existingCategory.id.value,
      );
      expect(foundModel).toBeNull();
    });

    it('should delete category with different states (active/inactive)', async () => {
      // Arrange
      const activeCategory = Category.fake()
        .createCategory()
        .withName('Active Category')
        .withDescription('Active Description')
        .activate()
        .build();
      const inactiveCategory = Category.fake()
        .createCategory()
        .withName('Inactive Category')
        .withDescription('Inactive Description')
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
      const allCategories = await CategoryModel.findAll();
      expect(allCategories).toHaveLength(0);

      expect(await repository.findById(activeCategory.id)).toBeNull();
      expect(await repository.findById(inactiveCategory.id)).toBeNull();
    });

    it('should delete multiple categories independently', async () => {
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
        .deactivate()
        .build();
      const category3 = Category.fake()
        .createCategory()
        .withName('Category 3')
        .withDescription('Description 3')
        .activate()
        .build();
      await repository.insert(category1);
      await repository.insert(category2);
      await repository.insert(category3);

      const input1: DeleteCategoryInput = {
        id: category1.id.value,
      };
      const input2: DeleteCategoryInput = {
        id: category3.id.value,
      };

      // Act
      await useCase.execute(input1);
      await useCase.execute(input2);

      // Assert
      const allCategories = await CategoryModel.findAll();
      expect(allCategories).toHaveLength(1);
      expect(allCategories[0].id).toBe(category2.id.value);

      expect(await repository.findById(category1.id)).toBeNull();
      expect(await repository.findById(category2.id)).not.toBeNull();
      expect(await repository.findById(category3.id)).toBeNull();
    });

    it('should delete category with null description', async () => {
      // Arrange
      const existingCategory = Category.fake()
        .createCategory()
        .withName('Category to Delete')
        .withDescription(null)
        .build();
      await repository.insert(existingCategory);

      const input: DeleteCategoryInput = {
        id: existingCategory.id.value,
      };

      // Act
      await useCase.execute(input);

      // Assert
      const found = await CategoryModel.findByPk(existingCategory.id.value);
      expect(found).toBeNull();
      const foundInRepository = await repository.findById(existingCategory.id);
      expect(foundInRepository).toBeNull();
    });
  });
});
