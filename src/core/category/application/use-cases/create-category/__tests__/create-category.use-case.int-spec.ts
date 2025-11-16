import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/repositories/category.sequelize.repository';
import { CreateCategoryUseCase } from '@core/category/application/use-cases/create-category/create-category.use-case';
import { setupSequelize } from '@core/shared/infra/testing/helpers';
import { CategoryModel } from '@core/category/infra/db/sequelize/model/category.model';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import type { CreateCategoryInput } from '@core/category/application/use-cases/create-category/create-category.input';

describe('Integration: [CreateCategoryUseCase]', () => {
  let useCase: CreateCategoryUseCase;
  let repository: CategorySequelizeRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new CategorySequelizeRepository(CategoryModel);
    useCase = new CreateCategoryUseCase(repository);
  });

  describe('[execute]', () => {
    it('should create a category with all fields and persist in database', async () => {
      // Arrange
      const input: CreateCategoryInput = {
        name: 'Action',
        description: 'Action movies category',
        is_active: true,
      };

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(output).toMatchObject({
        name: input.name,
        description: input.description,
        is_active: input.is_active,
      });
      expect(output.id).toBeDefined();
      expect(output.created_at).toBeInstanceOf(Date);

      const found = await CategoryModel.findByPk(output.id);
      expect(found).not.toBeNull();
      expect(found?.id).toBe(output.id);
      expect(found?.name).toBe(output.name);
      expect(found?.description).toBe(output.description);
      expect(found?.is_active).toBe(output.is_active);
      expect(found?.created_at).toEqual(output.created_at);
    });

    it('should create a category with only required fields and persist in database', async () => {
      // Arrange
      const input: CreateCategoryInput = {
        name: 'Comedy',
      };

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(output).toMatchObject({
        name: input.name,
        description: null,
        is_active: true,
      });
      expect(output.id).toBeDefined();
      expect(output.created_at).toBeInstanceOf(Date);

      const found = await CategoryModel.findByPk(output.id);
      expect(found).not.toBeNull();
      expect(found?.name).toBe(output.name);
      expect(found?.description).toBeNull();
      expect(found?.is_active).toBe(true);
    });

    it('should create a category with null description and persist in database', async () => {
      // Arrange
      const input: CreateCategoryInput = {
        name: 'Drama',
        description: null,
        is_active: false,
      };

      // Act
      const output = await useCase.execute(input);

      // Assert
      expect(output).toMatchObject({
        name: input.name,
        description: null,
        is_active: false,
      });
      expect(output.id).toBeDefined();
      expect(output.created_at).toBeInstanceOf(Date);

      const found = await CategoryModel.findByPk(output.id);
      expect(found).not.toBeNull();
      expect(found?.name).toBe(output.name);
      expect(found?.description).toBeNull();
      expect(found?.is_active).toBe(false);
    });

    it('should create multiple categories and persist all in database', async () => {
      // Arrange
      const inputs: CreateCategoryInput[] = [
        { name: 'Category 1', description: 'Description 1', is_active: true },
        { name: 'Category 2', description: null, is_active: false },
        { name: 'Category 3' },
      ];

      // Act
      const outputs = await Promise.all(
        inputs.map((input) => useCase.execute(input)),
      );

      // Assert
      expect(outputs).toHaveLength(3);

      const allCategories = await CategoryModel.findAll();
      expect(allCategories).toHaveLength(3);

      outputs.forEach((output, index) => {
        expect(output.name).toBe(inputs[index].name);
        const found = allCategories.find((c) => c.id === output.id);
        expect(found).toBeDefined();
        expect(found?.name).toBe(output.name);
        expect(found?.description).toBe(output.description);
        expect(found?.is_active).toBe(output.is_active);
      });
    });

    it('should create a category and verify it can be retrieved by id', async () => {
      // Arrange
      const input: CreateCategoryInput = {
        name: 'Horror',
        description: 'Horror movies',
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
  });
});
