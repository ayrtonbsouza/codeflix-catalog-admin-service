import { CategorySequelizeRepository } from '@/category/infra/db/sequelize/repositories/category.sequelize.repository';
import {
  UpdateCategoryUseCase,
  type UpdateCategoryInput,
} from '@/category/application/use-cases/update-category.use-case';
import { setupSequelize } from '@/shared/infra/testing/helpers';
import { CategoryModel } from '@/category/infra/db/sequelize/model/category.model';
import { Uuid } from '@/shared/domain/value-objects/uuid.vo';
import { Category } from '@/category/domain/entities/category.entity';
import { NotFoundError } from '@/shared/domain/errors/not-found.error';

describe('Integration: [UpdateCategoryUseCase]', () => {
  let useCase: UpdateCategoryUseCase;
  let repository: CategorySequelizeRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new CategorySequelizeRepository(CategoryModel);
    useCase = new UpdateCategoryUseCase(repository);
  });

  describe('[execute]', () => {
    it('should update a category with all fields and persist in database', async () => {
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

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(output).toMatchObject({
        id: existingCategory.id.value,
        name: input.name,
        description: input.description,
        is_active: input.is_active,
      });
      expect(output.created_at).toBeInstanceOf(Date);

      const found = await CategoryModel.findByPk(output.id);
      expect(found).not.toBeNull();
      expect(found?.id).toBe(output.id);
      expect(found?.name).toBe(output.name);
      expect(found?.description).toBe(output.description);
      expect(found?.is_active).toBe(output.is_active);
      expect(found?.created_at).toEqual(output.created_at);
    });

    it('should update only the name and persist in database', async () => {
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

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(output).toMatchObject({
        id: existingCategory.id.value,
        name: input.name,
        description: existingCategory.description,
        is_active: existingCategory.is_active,
      });

      const found = await CategoryModel.findByPk(output.id);
      expect(found).not.toBeNull();
      expect(found?.name).toBe(input.name);
      expect(found?.description).toBe(existingCategory.description);
      expect(found?.is_active).toBe(existingCategory.is_active);
    });

    it('should update only the description and persist in database', async () => {
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

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(output).toMatchObject({
        id: existingCategory.id.value,
        name: existingCategory.name,
        description: input.description,
        is_active: existingCategory.is_active,
      });

      const found = await CategoryModel.findByPk(output.id);
      expect(found).not.toBeNull();
      expect(found?.name).toBe(existingCategory.name);
      expect(found?.description).toBe(input.description);
      expect(found?.is_active).toBe(existingCategory.is_active);
    });

    it('should update description to null and persist in database', async () => {
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
        description: null,
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
      expect(found?.description).toBeNull();
    });

    it('should activate category when is_active is true and persist in database', async () => {
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

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(output).toMatchObject({
        id: existingCategory.id.value,
        name: existingCategory.name,
        description: existingCategory.description,
        is_active: true,
      });

      const found = await CategoryModel.findByPk(output.id);
      expect(found).not.toBeNull();
      expect(found?.is_active).toBe(true);
    });

    it('should deactivate category when is_active is false and persist in database', async () => {
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

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(output).toMatchObject({
        id: existingCategory.id.value,
        name: existingCategory.name,
        description: existingCategory.description,
        is_active: false,
      });

      const found = await CategoryModel.findByPk(output.id);
      expect(found).not.toBeNull();
      expect(found?.is_active).toBe(false);
    });

    it('should update multiple fields and persist in database', async () => {
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

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(output).toMatchObject({
        id: existingCategory.id.value,
        name: input.name,
        description: input.description,
        is_active: input.is_active,
      });

      const found = await CategoryModel.findByPk(output.id);
      expect(found).not.toBeNull();
      expect(found?.name).toBe(input.name);
      expect(found?.description).toBe(input.description);
      expect(found?.is_active).toBe(input.is_active);
    });

    it('should throw NotFoundError when category does not exist', async () => {
      // Arrange
      const nonExistentId = new Uuid().value;
      const input: UpdateCategoryInput = {
        id: nonExistentId,
        name: 'New Name',
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(NotFoundError);
    });

    it('should update category and verify it can be retrieved by id', async () => {
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

      // Act
      const output = await useCase.execute(input);
      const foundCategory = await repository.findById(new Uuid(output.id));

      // Assert
      expect(foundCategory).not.toBeNull();
      expect(foundCategory?.name).toBe(output.name);
      expect(foundCategory?.description).toBe(output.description);
      expect(foundCategory?.is_active).toBe(output.is_active);
      expect(foundCategory?.id.value).toBe(output.id);
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

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(output).toMatchObject({
        id: existingCategory.id.value,
        name: existingCategory.name,
        description: existingCategory.description,
        is_active: existingCategory.is_active,
      });

      const found = await CategoryModel.findByPk(output.id);
      expect(found).not.toBeNull();
      expect(found?.name).toBe(existingCategory.name);
      expect(found?.description).toBe(existingCategory.description);
      expect(found?.is_active).toBe(existingCategory.is_active);
    });

    it('should update multiple categories independently', async () => {
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
      await repository.insert(category1);
      await repository.insert(category2);

      const input1: UpdateCategoryInput = {
        id: category1.id.value,
        name: 'Updated Category 1',
        is_active: false,
      };
      const input2: UpdateCategoryInput = {
        id: category2.id.value,
        name: 'Updated Category 2',
        is_active: true,
      };

      // Act
      const output1 = await useCase.execute(input1);
      const output2 = await useCase.execute(input2);

      // Assert
      expect(output1.name).toBe('Updated Category 1');
      expect(output1.is_active).toBe(false);
      expect(output2.name).toBe('Updated Category 2');
      expect(output2.is_active).toBe(true);

      const allCategories = await CategoryModel.findAll();
      expect(allCategories).toHaveLength(2);

      const found1 = allCategories.find((c) => c.id === output1.id);
      const found2 = allCategories.find((c) => c.id === output2.id);

      expect(found1?.name).toBe('Updated Category 1');
      expect(found1?.is_active).toBe(false);
      expect(found2?.name).toBe('Updated Category 2');
      expect(found2?.is_active).toBe(true);
    });
  });
});
