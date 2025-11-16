import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/repositories/category.sequelize.repository';
import {
  GetCategoryUseCase,
  type GetCategoryInput,
} from '@core/category/application/use-cases/get-category/get-category.use-case';
import { setupSequelize } from '@core/shared/infra/testing/helpers';
import { CategoryModel } from '@core/category/infra/db/sequelize/model/category.model';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { Category } from '@core/category/domain/entities/category.entity';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';

describe('Integration: [GetCategoryUseCase]', () => {
  let useCase: GetCategoryUseCase;
  let repository: CategorySequelizeRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new CategorySequelizeRepository(CategoryModel);
    useCase = new GetCategoryUseCase(repository);
  });

  describe('[execute]', () => {
    it('should get a category with all fields and persist in database', async () => {
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
      expect(output).toMatchObject({
        id: existingCategory.id.value,
        name: existingCategory.name,
        description: existingCategory.description,
        is_active: existingCategory.is_active,
      });
      expect(output.created_at).toBeInstanceOf(Date);
      expect(output.created_at).toEqual(existingCategory.created_at);

      const found = await CategoryModel.findByPk(output.id);
      expect(found).not.toBeNull();
      expect(found?.id).toBe(output.id);
      expect(found?.name).toBe(output.name);
      expect(found?.description).toBe(output.description);
      expect(found?.is_active).toBe(output.is_active);
    });

    it('should get a category with null description and persist in database', async () => {
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

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(output).toMatchObject({
        id: existingCategory.id.value,
        name: existingCategory.name,
        description: null,
        is_active: existingCategory.is_active,
      });

      const found = await CategoryModel.findByPk(output.id);
      expect(found).not.toBeNull();
      expect(found?.name).toBe(output.name);
      expect(found?.description).toBeNull();
      expect(found?.is_active).toBe(output.is_active);
    });

    it('should get an active category and persist in database', async () => {
      // Arrange
      const existingCategory = Category.fake()
        .createCategory()
        .withName('Active Category')
        .withDescription('Active Description')
        .activate()
        .build();
      await repository.insert(existingCategory);

      const input: GetCategoryInput = {
        id: existingCategory.id.value,
      };

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(output).toMatchObject({
        id: existingCategory.id.value,
        name: existingCategory.name,
        is_active: true,
      });

      const found = await CategoryModel.findByPk(output.id);
      expect(found).not.toBeNull();
      expect(found?.is_active).toBe(true);
    });

    it('should get an inactive category and persist in database', async () => {
      // Arrange
      const existingCategory = Category.fake()
        .createCategory()
        .withName('Inactive Category')
        .withDescription('Inactive Description')
        .deactivate()
        .build();
      await repository.insert(existingCategory);

      const input: GetCategoryInput = {
        id: existingCategory.id.value,
      };

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(output).toMatchObject({
        id: existingCategory.id.value,
        name: existingCategory.name,
        is_active: false,
      });

      const found = await CategoryModel.findByPk(output.id);
      expect(found).not.toBeNull();
      expect(found?.is_active).toBe(false);
    });

    it('should throw NotFoundError when category does not exist', async () => {
      // Arrange
      const nonExistentId = new Uuid().value;
      const input: GetCategoryInput = {
        id: nonExistentId,
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(NotFoundError);
    });

    it('should get category and verify it matches the entity from repository', async () => {
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
      const foundCategory = await repository.findById(existingCategory.id);

      // Assert
      expect(foundCategory).not.toBeNull();
      expect(output.id).toBe(foundCategory?.id.value);
      expect(output.name).toBe(foundCategory?.name);
      expect(output.description).toBe(foundCategory?.description);
      expect(output.is_active).toBe(foundCategory?.is_active);
      expect(output.created_at).toEqual(foundCategory?.created_at);
    });

    it('should get category when multiple categories exist', async () => {
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

      const found = await CategoryModel.findByPk(output.id);
      expect(found).not.toBeNull();
      expect(found?.name).toBe(category2.name);
      expect(found?.is_active).toBe(category2.is_active);
    });

    it('should return output with all category properties correctly mapped from database', async () => {
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

      const found = await CategoryModel.findByPk(output.id);
      expect(found).not.toBeNull();
      expect(found?.id).toBe(output.id);
      expect(found?.name).toBe(output.name);
      expect(found?.description).toBe(output.description);
      expect(found?.is_active).toBe(output.is_active);
      expect(found?.created_at).toEqual(output.created_at);
    });
  });
});
