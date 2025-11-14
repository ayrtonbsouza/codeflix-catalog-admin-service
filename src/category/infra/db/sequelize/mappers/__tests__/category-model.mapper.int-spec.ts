import { Sequelize } from 'sequelize-typescript';
import { CategoryModelMapper } from '@/category/infra/db/sequelize/mappers/category-model.mapper';
import { Category } from '@/category/domain/entities/category.entity';
import { CategoryModel } from '@/category/infra/db/sequelize/model/category.model';
import { Uuid } from '@/shared/domain/value-objects/uuid.vo';

describe('Integration: [CategoryModelMapper]', () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      models: [CategoryModel],
      logging: false,
    });

    await sequelize.sync({ force: true });
  });

  afterEach(async () => {
    await sequelize.close();
  });
  describe('[toModel]', () => {
    it('should convert Category entity to CategoryModel', () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Test Category')
        .withDescription('Test Description')
        .activate()
        .build();

      // Act
      const model = CategoryModelMapper.toModel(category);

      // Assert
      expect(model).toBeInstanceOf(CategoryModel);
      expect(model.id).toBe(category.id.value);
      expect(model.name).toBe(category.name);
      expect(model.description).toBe(category.description);
      expect(model.is_active).toBe(category.is_active);
      expect(model.created_at).toEqual(category.created_at);
    });

    it('should convert Category with null description to CategoryModel', () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Category Without Description')
        .withDescription(null)
        .build();

      // Act
      const model = CategoryModelMapper.toModel(category);

      // Assert
      expect(model).toBeInstanceOf(CategoryModel);
      expect(model.id).toBe(category.id.value);
      expect(model.name).toBe(category.name);
      expect(model.description).toBeNull();
      expect(model.is_active).toBe(category.is_active);
      expect(model.created_at).toEqual(category.created_at);
    });

    it('should convert inactive Category to CategoryModel', () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Inactive Category')
        .deactivate()
        .build();

      // Act
      const model = CategoryModelMapper.toModel(category);

      // Assert
      expect(model).toBeInstanceOf(CategoryModel);
      expect(model.id).toBe(category.id.value);
      expect(model.name).toBe(category.name);
      expect(model.is_active).toBe(false);
    });

    it('should convert Category with all fields to CategoryModel', () => {
      // Arrange
      const id = new Uuid('550e8400-e29b-41d4-a716-446655440000');
      const createdAt = new Date('2024-01-01T10:00:00.000Z');
      const category = Category.fake()
        .createCategory()
        .withUuid(id)
        .withName('Complete Category')
        .withDescription('Complete Description')
        .activate()
        .withCreatedAt(createdAt)
        .build();

      // Act
      const model = CategoryModelMapper.toModel(category);

      // Assert
      expect(model).toBeInstanceOf(CategoryModel);
      expect(model.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(model.name).toBe('Complete Category');
      expect(model.description).toBe('Complete Description');
      expect(model.is_active).toBe(true);
      expect(model.created_at).toEqual(createdAt);
    });
  });

  describe('[toEntity]', () => {
    it('should convert CategoryModel to Category entity', () => {
      // Arrange
      const model = CategoryModel.build({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Test Category',
        description: 'Test Description',
        is_active: true,
        created_at: new Date('2024-01-01T10:00:00.000Z'),
      });

      // Act
      const entity = CategoryModelMapper.toEntity(model);

      // Assert
      expect(entity).toBeInstanceOf(Category);
      expect(entity.id).toBeInstanceOf(Uuid);
      expect(entity.id.value).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(entity.name).toBe('Test Category');
      expect(entity.description).toBe('Test Description');
      expect(entity.is_active).toBe(true);
      expect(entity.created_at).toEqual(new Date('2024-01-01T10:00:00.000Z'));
    });

    it('should convert CategoryModel with null description to Category entity', () => {
      // Arrange
      const model = CategoryModel.build({
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Category Without Description',
        description: null,
        is_active: true,
        created_at: new Date('2024-01-01T10:00:00.000Z'),
      });

      // Act
      const entity = CategoryModelMapper.toEntity(model);

      // Assert
      expect(entity).toBeInstanceOf(Category);
      expect(entity.id).toBeInstanceOf(Uuid);
      expect(entity.id.value).toBe('550e8400-e29b-41d4-a716-446655440001');
      expect(entity.name).toBe('Category Without Description');
      expect(entity.description).toBeNull();
      expect(entity.is_active).toBe(true);
    });

    it('should convert inactive CategoryModel to Category entity', () => {
      // Arrange
      const model = CategoryModel.build({
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Inactive Category',
        description: 'Some Description',
        is_active: false,
        created_at: new Date('2024-01-01T10:00:00.000Z'),
      });

      // Act
      const entity = CategoryModelMapper.toEntity(model);

      // Assert
      expect(entity).toBeInstanceOf(Category);
      expect(entity.id).toBeInstanceOf(Uuid);
      expect(entity.id.value).toBe('550e8400-e29b-41d4-a716-446655440002');
      expect(entity.name).toBe('Inactive Category');
      expect(entity.is_active).toBe(false);
    });

    it('should convert CategoryModel with all fields to Category entity', () => {
      // Arrange
      const createdAt = new Date('2024-01-01T10:00:00.000Z');
      const model = CategoryModel.build({
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'Complete Category',
        description: 'Complete Description',
        is_active: true,
        created_at: createdAt,
      });

      // Act
      const entity = CategoryModelMapper.toEntity(model);

      // Assert
      expect(entity).toBeInstanceOf(Category);
      expect(entity.id).toBeInstanceOf(Uuid);
      expect(entity.id.value).toBe('550e8400-e29b-41d4-a716-446655440003');
      expect(entity.name).toBe('Complete Category');
      expect(entity.description).toBe('Complete Description');
      expect(entity.is_active).toBe(true);
      expect(entity.created_at).toEqual(createdAt);
    });
  });

  describe('[round-trip conversion]', () => {
    it('should maintain data integrity when converting entity to model and back', () => {
      // Arrange
      const originalCategory = Category.fake()
        .createCategory()
        .withName('Round Trip Category')
        .withDescription('Round Trip Description')
        .activate()
        .build();

      // Act
      const model = CategoryModelMapper.toModel(originalCategory);
      const convertedCategory = CategoryModelMapper.toEntity(model);

      // Assert
      expect(convertedCategory.id.value).toBe(originalCategory.id.value);
      expect(convertedCategory.name).toBe(originalCategory.name);
      expect(convertedCategory.description).toBe(originalCategory.description);
      expect(convertedCategory.is_active).toBe(originalCategory.is_active);
      expect(convertedCategory.created_at).toEqual(originalCategory.created_at);
      expect(convertedCategory.toJSON()).toEqual(originalCategory.toJSON());
    });

    it('should maintain data integrity with null description', () => {
      // Arrange
      const originalCategory = Category.fake()
        .createCategory()
        .withName('Category With Null Description')
        .withDescription(null)
        .build();

      // Act
      const model = CategoryModelMapper.toModel(originalCategory);
      const convertedCategory = CategoryModelMapper.toEntity(model);

      // Assert
      expect(convertedCategory.id.value).toBe(originalCategory.id.value);
      expect(convertedCategory.name).toBe(originalCategory.name);
      expect(convertedCategory.description).toBeNull();
      expect(convertedCategory.is_active).toBe(originalCategory.is_active);
      expect(convertedCategory.created_at).toEqual(originalCategory.created_at);
    });

    it('should maintain data integrity with inactive category', () => {
      // Arrange
      const originalCategory = Category.fake()
        .createCategory()
        .withName('Inactive Round Trip Category')
        .deactivate()
        .build();

      // Act
      const model = CategoryModelMapper.toModel(originalCategory);
      const convertedCategory = CategoryModelMapper.toEntity(model);

      // Assert
      expect(convertedCategory.id.value).toBe(originalCategory.id.value);
      expect(convertedCategory.name).toBe(originalCategory.name);
      expect(convertedCategory.is_active).toBe(false);
      expect(convertedCategory.toJSON()).toEqual(originalCategory.toJSON());
    });
  });
});
