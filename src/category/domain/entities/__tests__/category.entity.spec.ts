import { Category } from '@/category/domain/entities/category.entity';
import { Uuid, InvalidUuidError } from '@/shared/domain/value-objects/uuid.vo';
import { EntityValidationError } from '@/shared/domain/validators/validation.error';

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

const mockValidate = jest.fn();
const mockValidator = {
  validate: mockValidate,
  errors: null as any,
};

jest.mock('@/category/domain/validators/category.validator', () => {
  const actual = jest.requireActual(
    '@/category/domain/validators/category.validator',
  );

  return {
    ...actual,
    CategoryValidatorFactory: {
      create: jest.fn(() => mockValidator),
    },
  };
});

describe('[Category Entity]', () => {
  beforeEach(() => {
    mockValidate.mockReturnValue(true);
    mockValidator.errors = null;
    jest.clearAllMocks();
  });

  describe('[constructor]', () => {
    it('should create a category with all fields provided', () => {
      // Arrange
      const id = new Uuid();
      const name = 'Category Test';
      const description = 'Test Description';
      const isActive = false;
      const createdAt = new Date('2024-01-01');

      // Act
      const category = new Category({
        id,
        name,
        description,
        is_active: isActive,
        created_at: createdAt,
      });

      // Assert
      expect(category.id).toBe(id);
      expect(category.name).toBe(name);
      expect(category.description).toBe(description);
      expect(category.is_active).toBe(isActive);
      expect(category.created_at).toBe(createdAt);
    });

    it('should create a category with only required fields (name)', () => {
      // Arrange
      const name = 'Category Test';

      // Act
      const category = new Category({ name });

      // Assert
      expect(category.name).toBe(name);
      expect(category.id).toBeInstanceOf(Uuid);
      expect(category.description).toBeNull();
      expect(category.is_active).toBe(true);
      expect(category.created_at).toBeInstanceOf(Date);
    });

    it('should use default values (description=null, is_active=true)', () => {
      // Arrange
      const name = 'Category Test';

      // Act
      const category = new Category({ name });

      // Assert
      expect(category.description).toBeNull();
      expect(category.is_active).toBe(true);
    });

    it('should accept is_active as false', () => {
      // Arrange
      const name = 'Category Test';
      const isActive = false;

      // Act
      const category = new Category({ name, is_active: isActive });

      // Assert
      expect(category.is_active).toBe(false);
    });

    it('should accept custom created_at date', () => {
      // Arrange
      const name = 'Category Test';
      const customDate = new Date('2024-01-01');

      // Act
      const category = new Category({ name, created_at: customDate });

      // Assert
      expect(category.created_at).toBe(customDate);
      expect(category.created_at.getTime()).toBe(customDate.getTime());
    });
  });

  describe('[create]', () => {
    it('should create a category using factory method with all fields', () => {
      // Arrange
      const name = 'Category Test';
      const description = 'Test Description';
      const isActive = false;

      // Act
      const category = Category.create({
        name,
        description,
        is_active: isActive,
      });

      // Assert
      expect(category).toBeInstanceOf(Category);
      expect(category.name).toBe(name);
      expect(category.description).toBe(description);
      expect(category.is_active).toBe(isActive);
      expect(mockValidate).toHaveBeenCalledWith(category);
      expect(mockValidate).toHaveBeenCalledTimes(1);
    });

    it('should create a category using factory method with minimum fields', () => {
      // Arrange
      const name = 'Category Test';

      // Act
      const category = Category.create({ name });

      // Assert
      expect(category).toBeInstanceOf(Category);
      expect(category.name).toBe(name);
      expect(mockValidate).toHaveBeenCalledWith(category);
      expect(mockValidate).toHaveBeenCalledTimes(1);
    });

    it('should set is_active to true by default', () => {
      // Arrange
      const name = 'Category Test';

      // Act
      const category = Category.create({ name });

      // Assert
      expect(category.is_active).toBe(true);
      expect(mockValidate).toHaveBeenCalledWith(category);
    });

    it('should generate id automatically as Uuid instance', () => {
      // Arrange
      const name = 'Category Test';

      // Act
      const category = Category.create({ name });

      // Assert
      expect(category.id).toBeInstanceOf(Uuid);
      expect(category.id.value).toBeDefined();
      expect(typeof category.id.value).toBe('string');
      expect(mockValidate).toHaveBeenCalledWith(category);
    });

    it('should throw an error if name is invalid (empty string)', () => {
      // Arrange
      const name = '' as any;
      mockValidate.mockReturnValue(false);
      mockValidator.errors = { name: ['name should not be empty'] };

      // Act & Assert
      expect(() => {
        Category.create({ name });
      }).toThrow(EntityValidationError);
      expect(mockValidate).toHaveBeenCalled();
    });

    it('should throw an error if name is too short (less than 3 characters)', () => {
      // Arrange
      const name = 'AB';
      mockValidate.mockReturnValue(false);
      mockValidator.errors = {
        name: ['name must be longer than or equal to 3 characters'],
      };

      // Act & Assert
      expect(() => {
        Category.create({ name });
      }).toThrow(EntityValidationError);
      expect(mockValidate).toHaveBeenCalled();
    });

    it('should throw an error if name is too long (more than 255 characters)', () => {
      // Arrange
      const name = 'A'.repeat(256);
      mockValidate.mockReturnValue(false);
      mockValidator.errors = {
        name: ['name must be shorter than or equal to 255 characters'],
      };

      // Act & Assert
      expect(() => {
        Category.create({ name });
      }).toThrow(EntityValidationError);
      expect(mockValidate).toHaveBeenCalled();
    });
  });

  describe('[changeName]', () => {
    it('should change the category name and call validator', () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Original Name')
        .build();
      const newName = 'Updated Name';

      // Act
      category.changeName(newName);

      // Assert
      expect(category.name).toBe(newName);
      expect(mockValidate).toHaveBeenCalledWith(category);
      expect(mockValidate).toHaveBeenCalledTimes(1);
    });

    it('should accept any valid string as name and call validator', () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Original Name')
        .build();
      const validNames = [
        'Short',
        'A Very Long Category Name With Spaces',
        'Name_With_Underscores',
      ];

      // Act & Assert
      validNames.forEach((name) => {
        category.changeName(name);
        expect(category.name).toBe(name);
      });
      expect(mockValidate).toHaveBeenCalledTimes(validNames.length);
    });

    it('should allow changing multiple times and call validator each time', () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Original Name')
        .build();
      const firstChange = 'First Change';
      const secondChange = 'Second Change';

      // Act
      category.changeName(firstChange);
      category.changeName(secondChange);

      // Assert
      expect(category.name).toBe(secondChange);
      expect(mockValidate).toHaveBeenCalledTimes(2);
    });

    it('should throw an error if name is an empty string', () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Original Name')
        .build();
      const emptyName = '';
      mockValidate.mockReturnValue(false);
      mockValidator.errors = { name: ['name should not be empty'] };

      // Act & Assert
      expect(() => {
        category.changeName(emptyName);
      }).toThrow(EntityValidationError);
      expect(mockValidate).toHaveBeenCalled();
    });

    it('should throw an error if name is undefined', () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Original Name')
        .build();
      const name = undefined as any;
      mockValidate.mockReturnValue(false);
      mockValidator.errors = { name: ['name must be a string'] };

      // Act & Assert
      expect(() => {
        category.changeName(name);
      }).toThrow(EntityValidationError);
      expect(mockValidate).toHaveBeenCalled();
    });

    it('should throw an error if name is null', () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Original Name')
        .build();
      const name = null as any;
      mockValidate.mockReturnValue(false);
      mockValidator.errors = { name: ['name should not be empty'] };

      // Act & Assert
      expect(() => {
        category.changeName(name);
      }).toThrow(EntityValidationError);
      expect(mockValidate).toHaveBeenCalled();
    });

    it('should throw an error if name is too short (less than 3 characters)', () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Original Name')
        .build();
      const shortName = 'AB';
      mockValidate.mockReturnValue(false);
      mockValidator.errors = {
        name: ['name must be longer than or equal to 3 characters'],
      };

      // Act & Assert
      expect(() => {
        category.changeName(shortName);
      }).toThrow(EntityValidationError);
      expect(mockValidate).toHaveBeenCalled();
    });

    it('should throw an error if name is too long (more than 255 characters)', () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Original Name')
        .build();
      const longName = 'A'.repeat(256);
      mockValidate.mockReturnValue(false);
      mockValidator.errors = {
        name: ['name must be shorter than or equal to 255 characters'],
      };

      // Act & Assert
      expect(() => {
        category.changeName(longName);
      }).toThrow(EntityValidationError);
      expect(mockValidate).toHaveBeenCalled();
    });
  });

  describe('[changeDescription]', () => {
    it('should change the category description and call validator', () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Test')
        .build();
      const newDescription = 'Updated Description';

      // Act
      category.changeDescription(newDescription);

      // Assert
      expect(category.description).toBe(newDescription);
      expect(mockValidate).toHaveBeenCalledWith(category);
      expect(mockValidate).toHaveBeenCalledTimes(1);
    });

    it('should allow empty description and call validator', () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Test')
        .build();
      const emptyDescription = '';

      // Act
      category.changeDescription(emptyDescription);

      // Assert
      expect(category.description).toBe(emptyDescription);
      expect(mockValidate).toHaveBeenCalledWith(category);
    });

    it('should allow changing multiple times and call validator each time', () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Test')
        .build();
      const firstChange = 'First Description';
      const secondChange = 'Second Description';

      // Act
      category.changeDescription(firstChange);
      category.changeDescription(secondChange);

      // Assert
      expect(category.description).toBe(secondChange);
      expect(mockValidate).toHaveBeenCalledTimes(2);
    });
  });

  describe('[activate]', () => {
    it('should set is_active to true', () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Test')
        .deactivate()
        .build();

      // Act
      category.activate();

      // Assert
      expect(category.is_active).toBe(true);
    });

    it('should keep as true if already active', () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Test')
        .activate()
        .build();

      // Act
      category.activate();

      // Assert
      expect(category.is_active).toBe(true);
    });
  });

  describe('[deactivate]', () => {
    it('should set is_active to false', () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Test')
        .activate()
        .build();

      // Act
      category.deactivate();

      // Assert
      expect(category.is_active).toBe(false);
    });

    it('should keep as false if already inactive', () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Test')
        .deactivate()
        .build();

      // Act
      category.deactivate();

      // Assert
      expect(category.is_active).toBe(false);
    });
  });

  describe('[toJSON]', () => {
    it('should return a JSON object with all properties', () => {
      // Arrange
      const id = new Uuid('550e8400-e29b-41d4-a716-446655440000');
      const name = 'Test';
      const description = 'Description';
      const isActive = true;
      const createdAt = new Date('2024-01-01');
      const category = new Category({
        id,
        name,
        description,
        is_active: isActive,
        created_at: createdAt,
      });

      // Act
      const json = category.toJSON();

      // Assert
      expect(json).toEqual({
        id: id.value,
        name,
        description,
        is_active: isActive,
        created_at: createdAt,
      });
    });

    it('should maintain correct types (string, boolean, Date)', () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Test')
        .build();

      // Act
      const json = category.toJSON();

      // Assert
      expect(typeof json.name).toBe('string');
      expect(typeof json.is_active).toBe('boolean');
      expect(json.created_at).toBeInstanceOf(Date);
    });

    it('should include id as string in JSON and description as null', () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Test')
        .withDescription(null)
        .build();

      // Act
      const json = category.toJSON();

      // Assert
      expect(typeof json.id).toBe('string');
      expect(json.description).toBeNull();
    });
  });

  describe('[integrated behaviors]', () => {
    it('should create an inactive category and then activate it', () => {
      // Arrange
      const name = 'Test Category';

      // Act
      const category = Category.fake()
        .createCategory()
        .withName(name)
        .deactivate()
        .build();
      category.activate();

      // Assert
      expect(category.is_active).toBe(true);
      expect(category.name).toBe(name);
    });

    it('should change name and description in sequence', () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Original Name')
        .withDescription('Original Description')
        .build();
      const newName = 'New Name';
      const newDescription = 'New Description';

      // Act
      category.changeName(newName);
      category.changeDescription(newDescription);

      // Assert
      expect(category.name).toBe(newName);
      expect(category.description).toBe(newDescription);
    });

    it('should serialize complete category to JSON', () => {
      // Arrange
      const id = new Uuid('550e8400-e29b-41d4-a716-446655440000');
      const name = 'Test';
      const description = 'Test Description';
      const isActive = false;
      const createdAt = new Date('2024-01-01');
      const category = new Category({
        id,
        name,
        description,
        is_active: isActive,
        created_at: createdAt,
      });

      // Act
      const json = category.toJSON();

      // Assert
      expect(json.id).toBe(id.value);
      expect(json.name).toBe(name);
      expect(json.description).toBe(description);
      expect(json.is_active).toBe(isActive);
      expect(json.created_at).toBe(createdAt);
    });

    it('should use toJSON after multiple changes', () => {
      // Arrange
      const category = Category.fake()
        .createCategory()
        .withName('Original')
        .activate()
        .build();

      // Act
      category.changeName('Updated Name');
      category.changeDescription('Updated Description');
      category.deactivate();
      const json = category.toJSON();

      // Assert
      expect(json.name).toBe('Updated Name');
      expect(json.description).toBe('Updated Description');
      expect(json.is_active).toBe(false);
    });
  });

  describe('[entity_id]', () => {
    it('should return the entity id as ValueObject', () => {
      // Arrange
      const name = 'Category Test';
      const category = Category.fake().createCategory().withName(name).build();

      // Act
      const entityId = category.entity_id;

      // Assert
      expect(entityId).toBeInstanceOf(Uuid);
      expect(entityId).toBe(category.id);
    });

    it('should return the same id when entity_id is called multiple times', () => {
      // Arrange
      const name = 'Category Test';
      const category = Category.fake().createCategory().withName(name).build();

      // Act
      const entityId1 = category.entity_id;
      const entityId2 = category.entity_id;

      // Assert
      expect(entityId1).toBe(entityId2);
      expect(entityId1).toBe(category.id);
    });

    it('should return a ValueObject with a valid UUID value', () => {
      // Arrange
      const customUuid = new Uuid('550e8400-e29b-41d4-a716-446655440000');
      const name = 'Category Test';
      const category = Category.fake()
        .createCategory()
        .withUuid(customUuid)
        .withName(name)
        .build();

      // Act
      const entityId = category.entity_id as Uuid;

      // Assert
      expect(entityId.value).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(entityId.equals(customUuid)).toBe(true);
    });

    it('should return a ValueObject that implements the equals method', () => {
      // Arrange
      const customUuid1 = new Uuid('550e8400-e29b-41d4-a716-446655440000');
      const customUuid2 = new Uuid('550e8400-e29b-41d4-a716-446655440001');
      const name1 = 'Category 1';
      const name2 = 'Category 2';
      const category1 = Category.fake()
        .createCategory()
        .withUuid(customUuid1)
        .withName(name1)
        .build();
      const category2 = Category.fake()
        .createCategory()
        .withUuid(customUuid2)
        .withName(name2)
        .build();

      // Act
      const entityId1 = category1.entity_id as Uuid;
      const entityId2 = category2.entity_id as Uuid;

      // Assert
      expect(entityId1.equals(entityId2)).toBe(false);
      expect(entityId1.equals(entityId1)).toBe(true);
    });
  });

  describe('[UUID integration behavior]', () => {
    it('should generate a Uuid instance when id is not provided', () => {
      // Arrange
      const name = 'Category Test';

      // Act
      const category = Category.fake().createCategory().withName(name).build();

      // Assert
      expect(category.id).toBeInstanceOf(Uuid);
      expect(typeof category.id.value).toBe('string');
      expect(category.id.value).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    it('should accept a Uuid instance when id is provided', () => {
      // Arrange
      const customUuid = new Uuid('550e8400-e29b-41d4-a716-446655440000');
      const name = 'Category Test';

      // Act
      const category = Category.fake()
        .createCategory()
        .withUuid(customUuid)
        .withName(name)
        .build();

      // Assert
      expect(category.id).toBe(customUuid);
      expect(category.id.value).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should throw InvalidUuidError when trying to create Uuid with invalid string', () => {
      // Arrange & Act & Assert
      expect(() => {
        new Uuid('invalid-uuid-string');
      }).toThrow(InvalidUuidError);
    });

    it('should throw InvalidUuidError when creating Uuid with invalid string and using it in Category', () => {
      // Arrange
      const name = 'Category Test';

      // Act & Assert
      expect(() => {
        const invalidUuid = new Uuid('not-a-valid-uuid');
        new Category({ id: invalidUuid, name });
      }).toThrow(InvalidUuidError);
    });

    it('should have different UUIDs generated for each category created without id', () => {
      // Arrange
      const name1 = 'Category 1';
      const name2 = 'Category 2';

      // Act
      const category1 = Category.fake()
        .createCategory()
        .withName(name1)
        .build();
      const category2 = Category.fake()
        .createCategory()
        .withName(name2)
        .build();

      // Assert
      expect(category1.id).toBeInstanceOf(Uuid);
      expect(category2.id).toBeInstanceOf(Uuid);
      expect(category1.id.value).not.toBe(category2.id.value);
    });
  });

  describe('[fake]', () => {
    it('should return CategoryFakeBuilder class', () => {
      // Arrange & Act
      const FakeBuilder = Category.fake();

      // Assert
      expect(FakeBuilder).toBeDefined();
      expect(FakeBuilder.createCategory).toBeDefined();
      expect(typeof FakeBuilder.createCategory).toBe('function');
      expect(FakeBuilder.createManyCategories).toBeDefined();
      expect(typeof FakeBuilder.createManyCategories).toBe('function');
    });

    it('should allow creating a single fake category using fake()', () => {
      // Arrange & Act
      const category = Category.fake().createCategory().build();

      // Assert
      expect(category).toBeInstanceOf(Category);
      expect(category.name).toBeDefined();
      expect(typeof category.name).toBe('string');
      expect(category.id).toBeInstanceOf(Uuid);
      expect(category.is_active).toBe(true);
    });

    it('should allow creating multiple fake categories using fake()', () => {
      // Arrange & Act
      const categories = Category.fake().createManyCategories(3).build();

      // Assert
      expect(Array.isArray(categories)).toBe(true);
      expect(categories).toHaveLength(3);
      categories.forEach((category) => {
        expect(category).toBeInstanceOf(Category);
        expect(category.name).toBeDefined();
      });
    });

    it('should allow chaining fake builder methods', () => {
      // Arrange
      const customUuid = new Uuid('550e8400-e29b-41d4-a716-446655440000');
      const customName = 'Fake Category';
      const customDescription = 'Fake Description';

      // Act
      const category = Category.fake()
        .createCategory()
        .withUuid(customUuid)
        .withName(customName)
        .withDescription(customDescription)
        .deactivate()
        .build();

      // Assert
      expect(category).toBeInstanceOf(Category);
      expect(category.id).toBe(customUuid);
      expect(category.name).toBe(customName);
      expect(category.description).toBe(customDescription);
      expect(category.is_active).toBe(false);
    });

    it('should create valid categories that can be used in tests', () => {
      // Arrange & Act
      const category = Category.fake()
        .createCategory()
        .withName('Test Category')
        .activate()
        .build();

      // Assert
      expect(category).toBeInstanceOf(Category);
      expect(category.name).toBe('Test Category');
      expect(category.is_active).toBe(true);
      expect(category.id).toBeInstanceOf(Uuid);
      expect(category.created_at).toBeInstanceOf(Date);
    });

    it('should allow creating categories with factory functions', () => {
      // Arrange
      const names = ['Category A', 'Category B', 'Category C'];

      // Act
      const categories = Category.fake()
        .createManyCategories(3)
        .withName((index) => names[index])
        .build();

      // Assert
      expect(categories[0].name).toBe('Category A');
      expect(categories[1].name).toBe('Category B');
      expect(categories[2].name).toBe('Category C');
    });
  });
});
