import { CategoryFakeBuilder } from '@/category/domain/builders/category-fake.builder';
import { Category } from '@/category/domain/entities/category.entity';
import { Uuid } from '@/shared/domain/value-objects/uuid.vo';

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

describe('[CategoryFakeBuilder]', () => {
  beforeEach(() => {
    callCount = 0;
    jest.clearAllMocks();
  });
  describe('[createCategory]', () => {
    it('should create a CategoryFakeBuilder instance', () => {
      // Arrange & Act
      const builder = CategoryFakeBuilder.createCategory();

      // Assert
      expect(builder).toBeInstanceOf(CategoryFakeBuilder);
    });

    it('should return a builder that builds a single Category', () => {
      // Arrange & Act
      const builder = CategoryFakeBuilder.createCategory();
      const category = builder.build();

      // Assert
      expect(category).toBeInstanceOf(Category);
      expect(Array.isArray(category)).toBe(false);
    });
  });

  describe('[createManyCategories]', () => {
    it('should create a CategoryFakeBuilder instance for multiple categories', () => {
      // Arrange & Act
      const builder = CategoryFakeBuilder.createManyCategories(3);

      // Assert
      expect(builder).toBeInstanceOf(CategoryFakeBuilder);
    });

    it('should return a builder that builds an array of Categories', () => {
      // Arrange & Act
      const builder = CategoryFakeBuilder.createManyCategories(3);
      const categories = builder.build();

      // Assert
      expect(Array.isArray(categories)).toBe(true);
      expect(categories).toHaveLength(3);
      categories.forEach((category) => {
        expect(category).toBeInstanceOf(Category);
      });
    });

    it('should build different number of categories based on count', () => {
      // Arrange & Act
      const builder1 = CategoryFakeBuilder.createManyCategories(5);
      const builder2 = CategoryFakeBuilder.createManyCategories(10);
      const categories1 = builder1.build();
      const categories2 = builder2.build();

      // Assert
      expect(categories1).toHaveLength(5);
      expect(categories2).toHaveLength(10);
    });
  });

  describe('[build]', () => {
    it('should build a Category with default values', () => {
      // Arrange & Act
      const category = CategoryFakeBuilder.createCategory().build();

      // Assert
      expect(category).toBeInstanceOf(Category);
      expect(category.name).toBeDefined();
      expect(typeof category.name).toBe('string');
      expect(category.description).toBeDefined();
      expect(category.is_active).toBe(true);
      expect(category.id).toBeInstanceOf(Uuid);
      expect(category.created_at).toBeInstanceOf(Date);
    });

    it('should build multiple Categories with default values', () => {
      // Arrange & Act
      const categories = CategoryFakeBuilder.createManyCategories(3).build();

      // Assert
      expect(Array.isArray(categories)).toBe(true);
      expect(categories).toHaveLength(3);
      categories.forEach((category) => {
        expect(category).toBeInstanceOf(Category);
        expect(category.name).toBeDefined();
        expect(category.is_active).toBe(true);
      });
    });

    it('should build Categories with different random values', () => {
      // Arrange & Act
      const categories = CategoryFakeBuilder.createManyCategories(3).build();

      // Assert
      const names = categories.map((c) => c.name);
      const uniqueNames = new Set(names);
      expect(names.length).toBe(3);
    });
  });

  describe('[withUuid]', () => {
    it('should set a custom UUID', () => {
      // Arrange
      const customUuid = new Uuid('550e8400-e29b-41d4-a716-446655440000');

      // Act
      const category = CategoryFakeBuilder.createCategory()
        .withUuid(customUuid)
        .build();

      // Assert
      expect(category.id).toBe(customUuid);
      expect(category.id.value).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should set UUID using factory function', () => {
      // Arrange
      const uuid1 = new Uuid('550e8400-e29b-41d4-a716-446655440000');
      const uuid2 = new Uuid('550e8400-e29b-41d4-a716-446655440001');

      // Act
      const categories = CategoryFakeBuilder.createManyCategories(2)
        .withUuid((index) => (index === 0 ? uuid1 : uuid2))
        .build();

      // Assert
      expect(categories[0].id).toBe(uuid1);
      expect(categories[1].id).toBe(uuid2);
    });

    it('should return builder instance for chaining', () => {
      // Arrange
      const customUuid = new Uuid();

      // Act
      const builder = CategoryFakeBuilder.createCategory().withUuid(customUuid);

      // Assert
      expect(builder).toBeInstanceOf(CategoryFakeBuilder);
    });
  });

  describe('[withName]', () => {
    it('should set a custom name', () => {
      // Arrange
      const customName = 'Custom Category Name';

      // Act
      const category = CategoryFakeBuilder.createCategory()
        .withName(customName)
        .build();

      // Assert
      expect(category.name).toBe(customName);
    });

    it('should set name using factory function', () => {
      // Arrange
      const names = ['Category 1', 'Category 2', 'Category 3'];

      // Act
      const categories = CategoryFakeBuilder.createManyCategories(3)
        .withName((index) => names[index])
        .build();

      // Assert
      expect(categories[0].name).toBe('Category 1');
      expect(categories[1].name).toBe('Category 2');
      expect(categories[2].name).toBe('Category 3');
    });

    it('should return builder instance for chaining', () => {
      // Arrange & Act
      const builder = CategoryFakeBuilder.createCategory().withName('Test');

      // Assert
      expect(builder).toBeInstanceOf(CategoryFakeBuilder);
    });
  });

  describe('[withDescription]', () => {
    it('should set a custom description', () => {
      // Arrange
      const customDescription = 'Custom Description';

      // Act
      const category = CategoryFakeBuilder.createCategory()
        .withDescription(customDescription)
        .build();

      // Assert
      expect(category.description).toBe(customDescription);
    });

    it('should set description to null', () => {
      // Arrange & Act
      const category = CategoryFakeBuilder.createCategory()
        .withDescription(null)
        .build();

      // Assert
      expect(category.description).toBeNull();
    });

    it('should set description using factory function', () => {
      // Arrange
      const descriptions = ['Desc 1', 'Desc 2', null];

      // Act
      const categories = CategoryFakeBuilder.createManyCategories(3)
        .withDescription((index) => descriptions[index])
        .build();

      // Assert
      expect(categories[0].description).toBe('Desc 1');
      expect(categories[1].description).toBe('Desc 2');
      expect(categories[2].description).toBeNull();
    });

    it('should return builder instance for chaining', () => {
      // Arrange & Act
      const builder =
        CategoryFakeBuilder.createCategory().withDescription('Test');

      // Assert
      expect(builder).toBeInstanceOf(CategoryFakeBuilder);
    });
  });

  describe('[activate]', () => {
    it('should set is_active to true', () => {
      // Arrange & Act
      const category = CategoryFakeBuilder.createCategory().activate().build();

      // Assert
      expect(category.is_active).toBe(true);
    });

    it('should override deactivate when activate is called', () => {
      // Arrange & Act
      const category = CategoryFakeBuilder.createCategory()
        .deactivate()
        .activate()
        .build();

      // Assert
      expect(category.is_active).toBe(true);
    });

    it('should return builder instance for chaining', () => {
      // Arrange & Act
      const builder = CategoryFakeBuilder.createCategory().activate();

      // Assert
      expect(builder).toBeInstanceOf(CategoryFakeBuilder);
    });
  });

  describe('[deactivate]', () => {
    it('should set is_active to false', () => {
      // Arrange & Act
      const category = CategoryFakeBuilder.createCategory()
        .deactivate()
        .build();

      // Assert
      expect(category.is_active).toBe(false);
    });

    it('should override activate when deactivate is called', () => {
      // Arrange & Act
      const category = CategoryFakeBuilder.createCategory()
        .activate()
        .deactivate()
        .build();

      // Assert
      expect(category.is_active).toBe(false);
    });

    it('should return builder instance for chaining', () => {
      // Arrange & Act
      const builder = CategoryFakeBuilder.createCategory().deactivate();

      // Assert
      expect(builder).toBeInstanceOf(CategoryFakeBuilder);
    });
  });

  describe('[withCreatedAt]', () => {
    it('should set a custom created_at date', () => {
      // Arrange
      const customDate = new Date('2024-01-01');

      // Act
      const category = CategoryFakeBuilder.createCategory()
        .withCreatedAt(customDate)
        .build();

      // Assert
      expect(category.created_at).toBe(customDate);
      expect(category.created_at.getTime()).toBe(customDate.getTime());
    });

    it('should set created_at using factory function', () => {
      // Arrange
      const dates = [
        new Date('2024-01-01'),
        new Date('2024-01-02'),
        new Date('2024-01-03'),
      ];

      // Act
      const categories = CategoryFakeBuilder.createManyCategories(3)
        .withCreatedAt((index) => dates[index])
        .build();

      // Assert
      expect(categories[0].created_at).toBe(dates[0]);
      expect(categories[1].created_at).toBe(dates[1]);
      expect(categories[2].created_at).toBe(dates[2]);
    });

    it('should return builder instance for chaining', () => {
      // Arrange
      const customDate = new Date();

      // Act
      const builder =
        CategoryFakeBuilder.createCategory().withCreatedAt(customDate);

      // Assert
      expect(builder).toBeInstanceOf(CategoryFakeBuilder);
    });
  });

  describe('[withNameTooLong]', () => {
    it('should set a name with 256 characters by default', () => {
      // Arrange & Act
      const category = CategoryFakeBuilder.createCategory()
        .withNameTooLong()
        .build();

      // Assert
      expect(category.name).toBeDefined();
      expect(category.name.length).toBeGreaterThanOrEqual(256);
    });

    it('should set a custom long name when provided', () => {
      // Arrange
      const longName = 'A'.repeat(300);

      // Act
      const category = CategoryFakeBuilder.createCategory()
        .withNameTooLong(longName)
        .build();

      // Assert
      expect(category.name).toBe(longName);
      expect(category.name.length).toBe(300);
    });

    it('should return builder instance for chaining', () => {
      // Arrange & Act
      const builder = CategoryFakeBuilder.createCategory().withNameTooLong();

      // Assert
      expect(builder).toBeInstanceOf(CategoryFakeBuilder);
    });
  });

  describe('[getters]', () => {
    describe('[id getter]', () => {
      it('should return the UUID value when set', () => {
        // Arrange
        const customUuid = new Uuid('550e8400-e29b-41d4-a716-446655440000');
        const builder =
          CategoryFakeBuilder.createCategory().withUuid(customUuid);

        // Act
        const id = builder.id;

        // Assert
        expect(id).toBe(customUuid);
      });

      it('should throw error when id is not set', () => {
        // Arrange
        const builder = CategoryFakeBuilder.createCategory();

        // Act & Assert
        expect(() => {
          const _id = builder.id;
        }).toThrow('Property id not found in CategoryFakeBuilder');
      });
    });

    describe('[name getter]', () => {
      it('should return the name value', () => {
        // Arrange
        const customName = 'Custom Name';
        const builder =
          CategoryFakeBuilder.createCategory().withName(customName);

        // Act
        const name = builder.name;

        // Assert
        expect(name).toBe(customName);
      });

      it('should return generated name when not set', () => {
        // Arrange
        const builder = CategoryFakeBuilder.createCategory();

        // Act
        const name = builder.name;

        // Assert
        expect(name).toBeDefined();
        expect(typeof name).toBe('string');
      });
    });

    describe('[description getter]', () => {
      it('should return the description value', () => {
        // Arrange
        const customDescription = 'Custom Description';
        const builder =
          CategoryFakeBuilder.createCategory().withDescription(
            customDescription,
          );

        // Act
        const description = builder.description;

        // Assert
        expect(description).toBe(customDescription);
      });

      it('should return generated description when not set', () => {
        // Arrange
        const builder = CategoryFakeBuilder.createCategory();

        // Act
        const description = builder.description;

        // Assert
        expect(description).toBeDefined();
      });
    });

    describe('[is_active getter]', () => {
      it('should return true when activated', () => {
        // Arrange
        const builder = CategoryFakeBuilder.createCategory().activate();

        // Act
        const isActive = builder.is_active;

        // Assert
        expect(isActive).toBe(true);
      });

      it('should return false when deactivated', () => {
        // Arrange
        const builder = CategoryFakeBuilder.createCategory().deactivate();

        // Act
        const isActive = builder.is_active;

        // Assert
        expect(isActive).toBe(false);
      });

      it('should return true by default', () => {
        // Arrange
        const builder = CategoryFakeBuilder.createCategory();

        // Act
        const isActive = builder.is_active;

        // Assert
        expect(isActive).toBe(true);
      });
    });

    describe('[created_at getter]', () => {
      it('should return the created_at value when set', () => {
        // Arrange
        const customDate = new Date('2024-01-01');
        const builder =
          CategoryFakeBuilder.createCategory().withCreatedAt(customDate);

        // Act
        const createdAt = builder.created_at;

        // Assert
        expect(createdAt).toBe(customDate);
      });

      it('should throw error when created_at is not set', () => {
        // Arrange
        const builder = CategoryFakeBuilder.createCategory();

        // Act & Assert
        expect(() => {
          const _createdAt = builder.created_at;
        }).toThrow('Property created_at not found in CategoryFakeBuilder');
      });
    });
  });

  describe('[chaining methods]', () => {
    it('should allow chaining multiple methods', () => {
      // Arrange
      const customUuid = new Uuid('550e8400-e29b-41d4-a716-446655440000');
      const customName = 'Chained Category';
      const customDescription = 'Chained Description';
      const customDate = new Date('2024-01-01');

      // Act
      const category = CategoryFakeBuilder.createCategory()
        .withUuid(customUuid)
        .withName(customName)
        .withDescription(customDescription)
        .deactivate()
        .withCreatedAt(customDate)
        .build();

      // Assert
      expect(category.id).toBe(customUuid);
      expect(category.name).toBe(customName);
      expect(category.description).toBe(customDescription);
      expect(category.is_active).toBe(false);
      expect(category.created_at).toBe(customDate);
    });

    it('should allow chaining with factory functions', () => {
      // Arrange
      const uuids = [
        new Uuid('550e8400-e29b-41d4-a716-446655440000'),
        new Uuid('550e8400-e29b-41d4-a716-446655440001'),
      ];
      const names = ['Category 1', 'Category 2'];

      // Act
      const categories = CategoryFakeBuilder.createManyCategories(2)
        .withUuid((index) => uuids[index])
        .withName((index) => names[index])
        .deactivate()
        .build();

      // Assert
      expect(categories[0].id).toBe(uuids[0]);
      expect(categories[0].name).toBe('Category 1');
      expect(categories[0].is_active).toBe(false);
      expect(categories[1].id).toBe(uuids[1]);
      expect(categories[1].name).toBe('Category 2');
      expect(categories[1].is_active).toBe(false);
    });
  });

  describe('[integration with Category entity]', () => {
    it('should build valid Category instances', () => {
      // Arrange & Act
      const category = CategoryFakeBuilder.createCategory().build();

      // Assert
      expect(category).toBeInstanceOf(Category);
      expect(category.id).toBeInstanceOf(Uuid);
      expect(typeof category.name).toBe('string');
      expect(category.name.length).toBeGreaterThan(0);
      expect(typeof category.is_active).toBe('boolean');
      expect(category.created_at).toBeInstanceOf(Date);
    });

    it('should build Categories that can be serialized to JSON', () => {
      // Arrange & Act
      const category = CategoryFakeBuilder.createCategory().build();
      const json = category.toJSON();

      // Assert
      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('name');
      expect(json).toHaveProperty('description');
      expect(json).toHaveProperty('is_active');
      expect(json).toHaveProperty('created_at');
      expect(typeof json.id).toBe('string');
      expect(typeof json.name).toBe('string');
      expect(typeof json.is_active).toBe('boolean');
      expect(json.created_at).toBeInstanceOf(Date);
    });

    it('should build Categories with all properties customizable', () => {
      // Arrange
      const customUuid = new Uuid('550e8400-e29b-41d4-a716-446655440000');
      const customName = 'Test Category';
      const customDescription = 'Test Description';
      const customDate = new Date('2024-01-01');

      // Act
      const category = CategoryFakeBuilder.createCategory()
        .withUuid(customUuid)
        .withName(customName)
        .withDescription(customDescription)
        .activate()
        .withCreatedAt(customDate)
        .build();

      // Assert
      expect(category.id.value).toBe(customUuid.value);
      expect(category.name).toBe(customName);
      expect(category.description).toBe(customDescription);
      expect(category.is_active).toBe(true);
      expect(category.created_at.getTime()).toBe(customDate.getTime());
    });
  });
});
