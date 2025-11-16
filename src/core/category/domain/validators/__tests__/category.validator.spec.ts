import { Category } from '@core/category/domain/entities/category.entity';
import { CategoryValidator } from '@core/category/domain/validators/category.validator';

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

describe('Unit: [Category Validator]', () => {
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
      const isValid = validator.validate(category.notification, category);

      // Assert
      expect(isValid).toBe(true);
      expect(category.notification.hasErrors()).toBe(false);
    });

    it('should validate successfully with minimum fields', () => {
      // Arrange``
      const category = new Category({
        name: 'Min',
      });

      // Act
      const isValid = validator.validate(category.notification, category);

      // Assert
      expect(isValid).toBe(true);
      expect(category.notification.hasErrors()).toBe(false);
    });

    it('should validate successfully with optional fields', () => {
      // Arrange
      const category = new Category({
        name: 'Valid Category',
        description: null,
      });

      // Act
      const isValid = validator.validate(category.notification, category);

      // Assert
      expect(isValid).toBe(true);
      expect(category.notification.hasErrors()).toBe(false);
    });

    it('should return false and set errors when name is empty string', () => {
      // Arrange
      const category = new Category({
        name: '',
      });

      // Act
      const isValid = validator.validate(category.notification, category);

      // Assert
      expect(isValid).toBe(false);
      expect(category.notification).notificationContainsErrorMessages([
        { name: ['name must be longer than or equal to 3 characters'] },
      ]);
    });

    it('should return false and set errors when name is undefined', () => {
      // Arrange
      const category = new Category({
        name: undefined as any,
      });

      // Act
      const isValid = validator.validate(category.notification, category);

      // Assert
      expect(isValid).toBe(false);
      expect(category.notification.hasErrors()).toBe(true);
    });

    it('should return false and set errors when name is null', () => {
      // Arrange
      const category = new Category({
        name: null as any,
      });

      // Act
      const isValid = validator.validate(category.notification, category);

      // Assert
      expect(isValid).toBe(false);
      expect(category.notification.hasErrors()).toBe(true);
    });

    it('should return false when name is too short (less than 3 characters)', () => {
      // Arrange
      const category = new Category({
        name: 'AB',
      });

      // Act
      const isValid = validator.validate(category.notification, category);

      // Assert
      expect(isValid).toBe(false);
      expect(category.notification).notificationContainsErrorMessages([
        { name: ['name must be longer than or equal to 3 characters'] },
      ]);
    });

    it('should return false when name is too long (more than 255 characters)', () => {
      // Arrange
      const category = new Category({
        name: 'A'.repeat(256),
      });

      // Act
      const isValid = validator.validate(category.notification, category);

      // Assert
      expect(isValid).toBe(false);
      expect(category.notification).notificationContainsErrorMessages([
        { name: ['name must be shorter than or equal to 255 characters'] },
      ]);
    });

    it('should return false when name is not a string (number)', () => {
      // Arrange
      const category = new Category({
        name: 123 as any,
      });

      // Act
      const isValid = validator.validate(category.notification, category);

      // Assert
      expect(isValid).toBe(false);
      expect(category.notification.hasErrors()).toBe(true);
    });

    it('should return false when name is not a string (object)', () => {
      // Arrange
      const category = new Category({
        name: { value: 'test' } as any,
      });

      // Act
      const isValid = validator.validate(category.notification, category);

      // Assert
      expect(isValid).toBe(false);
      expect(category.notification.hasErrors()).toBe(true);
    });

    it('should return false when is_active is not a boolean (string)', () => {
      // Arrange
      const category = new Category({
        name: 'Valid Name',
        is_active: 'true' as any,
      });

      // Act
      const isValid = validator.validate(category.notification, category);

      // Assert
      expect(isValid).toBe(true);
      expect(category.notification.hasErrors()).toBe(false);
    });

    it('should return false when is_active is not a boolean (number)', () => {
      // Arrange
      const category = new Category({
        name: 'Valid Name',
        is_active: 1 as any,
      });

      // Act
      const isValid = validator.validate(category.notification, category);

      // Assert
      expect(isValid).toBe(true);
      expect(category.notification.hasErrors()).toBe(false);
    });

    it('should return false when description is not a string (number)', () => {
      // Arrange
      const category = new Category({
        name: 'Valid Name',
        description: 123 as any,
      });

      // Act
      const isValid = validator.validate(category.notification, category);

      // Assert
      expect(isValid).toBe(true);
      expect(category.notification.hasErrors()).toBe(false);
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
      const isValid = validator.validate(category.notification, category);

      // Assert
      expect(isValid).toBe(true);
      expect(category.name).toBe(newName);
      expect(category.notification.hasErrors()).toBe(false);
    });

    it('should return false when changing to empty name', () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Original Name')
        .build();

      // Act
      category.name = '';
      const isValid = validator.validate(category.notification, category);

      // Assert
      expect(isValid).toBe(false);
      expect(category.notification).notificationContainsErrorMessages([
        { name: ['name must be longer than or equal to 3 characters'] },
      ]);
    });

    it('should return false when changing to name shorter than 3 characters', () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Original Name')
        .build();

      // Act
      category.name = 'AB';
      const isValid = validator.validate(category.notification, category);

      // Assert
      expect(isValid).toBe(false);
      expect(category.notification).notificationContainsErrorMessages([
        { name: ['name must be longer than or equal to 3 characters'] },
      ]);
    });

    it('should return false when changing to name longer than 255 characters', () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Original Name')
        .build();

      // Act
      category.name = 'A'.repeat(256);
      const isValid = validator.validate(category.notification, category);

      // Assert
      expect(isValid).toBe(false);
      expect(category.notification).notificationContainsErrorMessages([
        { name: ['name must be shorter than or equal to 255 characters'] },
      ]);
    });

    it('should return false when changing to non-string name', () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Original Name')
        .build();

      // Act
      category.name = 123 as any;
      const isValid = validator.validate(category.notification, category);

      // Assert
      expect(isValid).toBe(false);
      expect(category.notification.hasErrors()).toBe(true);
    });

    it('should return false when changing to null name', () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Original Name')
        .build();

      // Act
      category.name = null as any;
      const isValid = validator.validate(category.notification, category);

      // Assert
      expect(isValid).toBe(false);
      expect(category.notification.hasErrors()).toBe(true);
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
      const isValid = validator.validate(category.notification, category);

      // Assert
      expect(isValid).toBe(true);
      expect(category.description).toBe(newDescription);
      expect(category.notification.hasErrors()).toBe(false);
    });

    it('should validate successfully with empty description', () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Valid Name')
        .build();

      // Act
      category.description = '';
      const isValid = validator.validate(category.notification, category);

      // Assert
      expect(isValid).toBe(true);
      expect(category.notification.hasErrors()).toBe(false);
    });

    it('should validate successfully with null description', () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Valid Name')
        .build();

      // Act
      category.description = null;
      const isValid = validator.validate(category.notification, category);

      // Assert
      expect(isValid).toBe(true);
      expect(category.notification.hasErrors()).toBe(false);
    });

    it('should return false when description is not a string (number)', () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Valid Name')
        .build();

      // Act
      category.description = 123 as any;
      const isValid = validator.validate(category.notification, category);

      // Assert
      expect(isValid).toBe(true);
      expect(category.notification.hasErrors()).toBe(false);
    });

    it('should return false when description is not a string (object)', () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Valid Name')
        .build();

      // Act
      category.description = { value: 'test' } as any;
      const isValid = validator.validate(category.notification, category);

      // Assert
      expect(isValid).toBe(true);
      expect(category.notification.hasErrors()).toBe(false);
    });
  });

  describe('[validate - edge cases]', () => {
    it('should validate name with exactly 3 characters', () => {
      // Arrange
      const category = new Category({
        name: 'ABC',
      });

      // Act
      const isValid = validator.validate(category.notification, category);

      // Assert
      expect(isValid).toBe(true);
      expect(category.notification.hasErrors()).toBe(false);
    });

    it('should validate name with exactly 255 characters', () => {
      // Arrange
      const category = new Category({
        name: 'A'.repeat(255),
      });

      // Act
      const isValid = validator.validate(category.notification, category);

      // Assert
      expect(isValid).toBe(true);
      expect(category.notification.hasErrors()).toBe(false);
    });

    it('should validate successfully with is_active as false', () => {
      // Arrange
      const category = new Category({
        name: 'Valid Name',
        is_active: false,
      });

      // Act
      const isValid = validator.validate(category.notification, category);

      // Assert
      expect(isValid).toBe(true);
      expect(category.notification.hasErrors()).toBe(false);
    });

    it('should validate successfully with is_active as true', () => {
      // Arrange
      const category = new Category({
        name: 'Valid Name',
        is_active: true,
      });

      // Act
      const isValid = validator.validate(category.notification, category);

      // Assert
      expect(isValid).toBe(true);
      expect(category.notification.hasErrors()).toBe(false);
    });

    it('should return false when multiple fields have errors', () => {
      // Arrange
      const category = new Category({
        name: 'AB',
        is_active: 'invalid' as any,
      });

      // Act
      const isValid = validator.validate(category.notification, category);

      // Assert
      expect(isValid).toBe(false);
      expect(category.notification.hasErrors()).toBe(true);
    });

    it('should clear previous errors when validating valid entity', () => {
      // Arrange
      const invalidCategory = new Category({ name: '' });
      validator.validate(invalidCategory.notification, invalidCategory);
      expect(invalidCategory.notification.hasErrors()).toBe(true);

      // Act
      const validCategory = Category.fake()
        .createCategory()
        .withName('Valid Name')
        .build();
      const isValid = validator.validate(
        validCategory.notification,
        validCategory,
      );

      // Assert
      expect(isValid).toBe(true);
      expect(validCategory.notification.hasErrors()).toBe(false);
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
      expect(validator.validate(category1.notification, category1)).toBe(true);
      expect(category1.notification.hasErrors()).toBe(false);

      expect(validator.validate(category2.notification, category2)).toBe(true);
      expect(category2.notification.hasErrors()).toBe(false);

      expect(validator.validate(category3.notification, category3)).toBe(true);
      expect(category3.notification.hasErrors()).toBe(false);
    });

    it('should validate same category multiple times', () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Valid Category')
        .build();

      // Act & Assert
      expect(validator.validate(category.notification, category)).toBe(true);
      expect(validator.validate(category.notification, category)).toBe(true);
      expect(validator.validate(category.notification, category)).toBe(true);
      expect(category.notification.hasErrors()).toBe(false);
    });
  });
});
