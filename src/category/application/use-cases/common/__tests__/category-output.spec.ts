import { CategoryOutputMapper } from '@/category/application/use-cases/common/category-output';
import { Category } from '@/category/domain/entities/category.entity';
import { CategoryFakeBuilder } from '@/category/domain/builders/category-fake.builder';
import { Uuid } from '@/shared/domain/value-objects/uuid.vo';

describe('Unit: [CategoryOutputMapper]', () => {
  describe('[toOutput]', () => {
    it('should convert a Category entity to CategoryOutput with all fields', () => {
      // Arrange
      const category = CategoryFakeBuilder.createCategory()
        .withName('Action')
        .withDescription('Action movies category')
        .activate()
        .build();

      // Act
      const output = CategoryOutputMapper.toOutput(category);

      // Assert
      expect(output).toMatchObject({
        id: category.id.value,
        name: category.name,
        description: category.description,
        is_active: category.is_active,
        created_at: category.created_at,
      });
      expect(output.id).toBe(category.id.value);
      expect(output.name).toBe('Action');
      expect(output.description).toBe('Action movies category');
      expect(output.is_active).toBe(true);
      expect(output.created_at).toBeInstanceOf(Date);
    });

    it('should convert a Category entity to CategoryOutput with null description', () => {
      // Arrange
      const category = CategoryFakeBuilder.createCategory()
        .withName('Comedy')
        .withDescription(null)
        .activate()
        .build();

      // Act
      const output = CategoryOutputMapper.toOutput(category);

      // Assert
      expect(output).toMatchObject({
        id: category.id.value,
        name: category.name,
        description: null,
        is_active: category.is_active,
        created_at: category.created_at,
      });
      expect(output.id).toBe(category.id.value);
      expect(output.name).toBe('Comedy');
      expect(output.description).toBeNull();
      expect(output.is_active).toBe(true);
      expect(output.created_at).toBeInstanceOf(Date);
    });

    it('should convert a Category entity to CategoryOutput with inactive status', () => {
      // Arrange
      const category = CategoryFakeBuilder.createCategory()
        .withName('Drama')
        .withDescription('Drama movies category')
        .deactivate()
        .build();

      // Act
      const output = CategoryOutputMapper.toOutput(category);

      // Assert
      expect(output).toMatchObject({
        id: category.id.value,
        name: category.name,
        description: category.description,
        is_active: false,
        created_at: category.created_at,
      });
      expect(output.id).toBe(category.id.value);
      expect(output.name).toBe('Drama');
      expect(output.description).toBe('Drama movies category');
      expect(output.is_active).toBe(false);
      expect(output.created_at).toBeInstanceOf(Date);
    });

    it('should convert a Category entity to CategoryOutput and ensure id is a string', () => {
      // Arrange
      const uuid = new Uuid();
      const category = CategoryFakeBuilder.createCategory()
        .withUuid(uuid)
        .withName('Horror')
        .build();

      // Act
      const output = CategoryOutputMapper.toOutput(category);

      // Assert
      expect(typeof output.id).toBe('string');
      expect(output.id).toBe(uuid.value);
      expect(output.id).toBe(category.id.value);
    });

    it('should convert a Category entity to CategoryOutput with custom created_at', () => {
      // Arrange
      const customDate = new Date('2024-01-01T00:00:00.000Z');
      const category = CategoryFakeBuilder.createCategory()
        .withName('Sci-Fi')
        .withDescription('Science Fiction movies')
        .withCreatedAt(customDate)
        .activate()
        .build();

      // Act
      const output = CategoryOutputMapper.toOutput(category);

      // Assert
      expect(output.created_at).toBe(customDate);
      expect(output.created_at).toBeInstanceOf(Date);
      expect(output).toMatchObject({
        id: category.id.value,
        name: 'Sci-Fi',
        description: 'Science Fiction movies',
        is_active: true,
        created_at: customDate,
      });
    });

    it('should return a CategoryOutput type with all required properties', () => {
      // Arrange
      const category = CategoryFakeBuilder.createCategory()
        .withName('Thriller')
        .withDescription('Thriller movies')
        .activate()
        .build();

      // Act
      const output = CategoryOutputMapper.toOutput(category);

      // Assert
      expect(output).toHaveProperty('id');
      expect(output).toHaveProperty('name');
      expect(output).toHaveProperty('description');
      expect(output).toHaveProperty('is_active');
      expect(output).toHaveProperty('created_at');
      expect(typeof output.id).toBe('string');
      expect(typeof output.name).toBe('string');
      expect(typeof output.is_active).toBe('boolean');
      expect(output.created_at).toBeInstanceOf(Date);
    });

    it('should correctly map all properties from Category entity to CategoryOutput', () => {
      // Arrange
      const category = new Category({
        name: 'Documentary',
        description: 'Documentary films',
        is_active: true,
      });

      // Act
      const output = CategoryOutputMapper.toOutput(category);

      // Assert
      expect(output.id).toBe(category.id.value);
      expect(output.name).toBe(category.name);
      expect(output.description).toBe(category.description);
      expect(output.is_active).toBe(category.is_active);
      expect(output.created_at).toBe(category.created_at);
    });
  });
});
