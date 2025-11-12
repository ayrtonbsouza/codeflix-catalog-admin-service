import { Category } from '@/category/domain/entities/category.entity';
import { CategoryValidator } from '@/category/domain/validators/category.validator';

let callCount = 0;
const uuidValues = [
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002',
];

jest.mock('uuid', () => ({
  v4: jest.fn(() => {
    const value = uuidValues[callCount % uuidValues.length];
    callCount++;
    return value;
  }),
  validate: jest.fn((value: string) => {
    if (!value || value.length === 0) {
      return false;
    }
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }),
}));

describe('[Category Validator]', () => {
  let validator: CategoryValidator;

  beforeEach(() => {
    validator = new CategoryValidator();
    jest.clearAllMocks();
  });

  describe('[validate - create method]', () => {
    it('should validate successfully with all valid fields', () => {
      // Arrange
      const category = new Category({
        name: 'Valid Category Name',
        description: 'Valid Description',
        is_active: true,
      });

      // Act
      const isValid = validator.validate(category);

      // Assert
      expect(isValid).toBe(true);
      expect(validator.errors).toBeNull();
      expect(validator.validatedData).not.toBeNull();
    });

    it('should validate successfully with minimum fields', () => {
      // Arrange``
      const category = new Category({
        name: 'Min',
      });

      // Act
      const isValid = validator.validate(category);

      // Assert
      expect(isValid).toBe(true);
      expect(validator.errors).toBeNull();
    });

    it('should validate successfully with optional fields', () => {
      // Arrange
      const category = new Category({
        name: 'Valid Category',
        description: null,
      });

      // Act
      const isValid = validator.validate(category);

      // Assert
      expect(isValid).toBe(true);
      expect(validator.errors).toBeNull();
    });

    it('should return false and set errors when name is empty string', () => {
      // Arrange
      const category = new Category({
        name: '',
      });

      // Act
      const isValid = validator.validate(category);

      // Assert
      expect(isValid).toBe(false);
      expect({ validator, data: category }).containsErrorMessages({
        name: ['name should not be empty'],
      });
      expect(validator.validatedData).toBeNull();
    });

    it('should return false and set errors when name is undefined', () => {
      // Arrange
      const category = new Category({
        name: undefined as any,
      });

      // Act
      const isValid = validator.validate(category);

      // Assert
      expect(isValid).toBe(false);
      expect({ validator, data: category }).containsErrorMessages({
        name: expect.any(Array),
      });
      expect(validator.validatedData).toBeNull();
    });

    it('should return false and set errors when name is null', () => {
      // Arrange
      const category = new Category({
        name: null as any,
      });

      // Act
      const isValid = validator.validate(category);

      // Assert
      expect(isValid).toBe(false);
      expect({ validator, data: category }).containsErrorMessages({
        name: expect.any(Array),
      });
      expect(validator.validatedData).toBeNull();
    });

    it('should return false when name is too short (less than 3 characters)', () => {
      // Arrange
      const category = new Category({
        name: 'AB',
      });

      // Act
      const isValid = validator.validate(category);

      // Assert
      expect(isValid).toBe(false);
      expect({ validator, data: category }).containsErrorMessages({
        name: ['name must be longer than or equal to 3 characters'],
      });
      expect(validator.validatedData).toBeNull();
    });

    it('should return false when name is too long (more than 255 characters)', () => {
      // Arrange
      const category = new Category({
        name: 'A'.repeat(256),
      });

      // Act
      const isValid = validator.validate(category);

      // Assert
      expect(isValid).toBe(false);
      expect({ validator, data: category }).containsErrorMessages({
        name: ['name must be shorter than or equal to 255 characters'],
      });
      expect(validator.validatedData).toBeNull();
    });

    it('should return false when name is not a string (number)', () => {
      // Arrange
      const category = new Category({
        name: 123 as any,
      });

      // Act
      const isValid = validator.validate(category);

      // Assert
      expect(isValid).toBe(false);
      expect({ validator, data: category }).containsErrorMessages({
        name: ['name must be a string'],
      });
      expect(validator.validatedData).toBeNull();
    });

    it('should return false when name is not a string (object)', () => {
      // Arrange
      const category = new Category({
        name: { value: 'test' } as any,
      });

      // Act
      const isValid = validator.validate(category);

      // Assert
      expect(isValid).toBe(false);
      expect({ validator, data: category }).containsErrorMessages({
        name: ['name must be a string'],
      });
      expect(validator.validatedData).toBeNull();
    });

    it('should return false when is_active is not a boolean (string)', () => {
      // Arrange
      const category = new Category({
        name: 'Valid Name',
        is_active: 'true' as any,
      });

      // Act
      const isValid = validator.validate(category);

      // Assert
      expect(isValid).toBe(false);
      expect({ validator, data: category }).containsErrorMessages({
        is_active: ['is_active must be a boolean value'],
      });
      expect(validator.validatedData).toBeNull();
    });

    it('should return false when is_active is not a boolean (number)', () => {
      // Arrange
      const category = new Category({
        name: 'Valid Name',
        is_active: 1 as any,
      });

      // Act
      const isValid = validator.validate(category);

      // Assert
      expect(isValid).toBe(false);
      expect({ validator, data: category }).containsErrorMessages({
        is_active: ['is_active must be a boolean value'],
      });
      expect(validator.validatedData).toBeNull();
    });

    it('should return false when description is not a string (number)', () => {
      // Arrange
      const category = new Category({
        name: 'Valid Name',
        description: 123 as any,
      });

      // Act
      const isValid = validator.validate(category);

      // Assert
      expect(isValid).toBe(false);
      expect({ validator, data: category }).containsErrorMessages({
        description: ['description must be a string'],
      });
      expect(validator.validatedData).toBeNull();
    });
  });

  describe('[validate - changeName method]', () => {
    it('should validate successfully with valid name', () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Original Name')
        .build();
      const newName = 'Updated Name';

      // Act
      category.changeName(newName);
      const isValid = validator.validate(category);

      // Assert
      expect(isValid).toBe(true);
      expect(category.name).toBe(newName);
      expect(validator.errors).toBeNull();
    });

    it('should return false when changing to empty name', () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Original Name')
        .build();

      // Act
      category.name = '';
      const isValid = validator.validate(category);

      // Assert
      expect(isValid).toBe(false);
      expect({ validator, data: category }).containsErrorMessages({
        name: ['name should not be empty'],
      });
      expect(validator.validatedData).toBeNull();
    });

    it('should return false when changing to name shorter than 3 characters', () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Original Name')
        .build();

      // Act
      category.name = 'AB';
      const isValid = validator.validate(category);

      // Assert
      expect(isValid).toBe(false);
      expect({ validator, data: category }).containsErrorMessages({
        name: ['name must be longer than or equal to 3 characters'],
      });
      expect(validator.validatedData).toBeNull();
    });

    it('should return false when changing to name longer than 255 characters', () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Original Name')
        .build();

      // Act
      category.name = 'A'.repeat(256);
      const isValid = validator.validate(category);

      // Assert
      expect(isValid).toBe(false);
      expect({ validator, data: category }).containsErrorMessages({
        name: ['name must be shorter than or equal to 255 characters'],
      });
      expect(validator.validatedData).toBeNull();
    });

    it('should return false when changing to non-string name', () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Original Name')
        .build();

      // Act
      category.name = 123 as any;
      const isValid = validator.validate(category);

      // Assert
      expect(isValid).toBe(false);
      expect({ validator, data: category }).containsErrorMessages({
        name: ['name must be a string'],
      });
      expect(validator.validatedData).toBeNull();
    });

    it('should return false when changing to null name', () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Original Name')
        .build();

      // Act
      category.name = null as any;
      const isValid = validator.validate(category);

      // Assert
      expect(isValid).toBe(false);
      expect({ validator, data: category }).containsErrorMessages({
        name: expect.any(Array),
      });
      expect(validator.validatedData).toBeNull();
    });
  });

  describe('[validate - changeDescription method]', () => {
    it('should validate successfully with valid description', () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Valid Name')
        .build();
      const newDescription = 'Updated Description';

      // Act
      category.changeDescription(newDescription);
      const isValid = validator.validate(category);

      // Assert
      expect(isValid).toBe(true);
      expect(category.description).toBe(newDescription);
      expect(validator.errors).toBeNull();
    });

    it('should validate successfully with empty description', () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Valid Name')
        .build();

      // Act
      category.description = '';
      const isValid = validator.validate(category);

      // Assert
      expect(isValid).toBe(true);
      expect(validator.errors).toBeNull();
    });

    it('should validate successfully with null description', () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Valid Name')
        .build();

      // Act
      category.description = null;
      const isValid = validator.validate(category);

      // Assert
      expect(isValid).toBe(true);
      expect(validator.errors).toBeNull();
    });

    it('should return false when description is not a string (number)', () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Valid Name')
        .build();

      // Act
      category.description = 123 as any;
      const isValid = validator.validate(category);

      // Assert
      expect(isValid).toBe(false);
      expect({ validator, data: category }).containsErrorMessages({
        description: ['description must be a string'],
      });
      expect(validator.validatedData).toBeNull();
    });

    it('should return false when description is not a string (object)', () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Valid Name')
        .build();

      // Act
      category.description = { value: 'test' } as any;
      const isValid = validator.validate(category);

      // Assert
      expect(isValid).toBe(false);
      expect({ validator, data: category }).containsErrorMessages({
        description: ['description must be a string'],
      });
      expect(validator.validatedData).toBeNull();
    });
  });

  describe('[validate - edge cases]', () => {
    it('should validate name with exactly 3 characters', () => {
      // Arrange
      const category = new Category({
        name: 'ABC',
      });

      // Act
      const isValid = validator.validate(category);

      // Assert
      expect(isValid).toBe(true);
      expect(validator.errors).toBeNull();
    });

    it('should validate name with exactly 255 characters', () => {
      // Arrange
      const category = new Category({
        name: 'A'.repeat(255),
      });

      // Act
      const isValid = validator.validate(category);

      // Assert
      expect(isValid).toBe(true);
      expect(validator.errors).toBeNull();
    });

    it('should validate successfully with is_active as false', () => {
      // Arrange
      const category = new Category({
        name: 'Valid Name',
        is_active: false,
      });

      // Act
      const isValid = validator.validate(category);

      // Assert
      expect(isValid).toBe(true);
      expect(validator.errors).toBeNull();
    });

    it('should validate successfully with is_active as true', () => {
      // Arrange
      const category = new Category({
        name: 'Valid Name',
        is_active: true,
      });

      // Act
      const isValid = validator.validate(category);

      // Assert
      expect(isValid).toBe(true);
      expect(validator.errors).toBeNull();
    });

    it('should return false when multiple fields have errors', () => {
      // Arrange
      const category = new Category({
        name: 'AB',
        is_active: 'invalid' as any,
      });

      // Act
      const isValid = validator.validate(category);

      // Assert
      expect(isValid).toBe(false);
      expect({ validator, data: category }).containsErrorMessages({
        name: expect.any(Array),
        is_active: expect.any(Array),
      });
      expect(validator.validatedData).toBeNull();
    });

    it('should clear previous errors when validating valid entity', () => {
      // Arrange
      const invalidCategory = new Category({ name: '' });
      validator.validate(invalidCategory);
      expect(validator.errors).not.toBeNull();

      // Act
      const validCategory = Category.fake()
        .createCategory()
        .withName('Valid Name')
        .build();
      validator.errors = null;
      validator.validatedData = null;
      const isValid = validator.validate(validCategory);

      // Assert
      expect(isValid).toBe(true);
      expect(validator.errors).toBeNull();
      expect(validator.validatedData).not.toBeNull();
    });
  });

  describe('[validate - reusability]', () => {
    it('should be able to validate multiple different categories', () => {
      // Arrange
      const [category1, category2, category3] = Category.fake()
        .createManyCategories(3)
        .withName((index) => `Category ${index + 1}`)
        .build();

      // Act & Assert
      expect(validator.validate(category1)).toBe(true);
      expect(validator.errors).toBeNull();

      expect(validator.validate(category2)).toBe(true);
      expect(validator.errors).toBeNull();

      expect(validator.validate(category3)).toBe(true);
      expect(validator.errors).toBeNull();
    });

    it('should validate same category multiple times', () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Valid Category')
        .build();

      // Act & Assert
      expect(validator.validate(category)).toBe(true);
      expect(validator.validate(category)).toBe(true);
      expect(validator.validate(category)).toBe(true);
      expect(validator.errors).toBeNull();
    });
  });
});
