import { Category } from '@/category/domain/entities/category.entity';
import { Uuid, InvalidUuidError } from '@/shared/domain/value-objects/uuid.vo';

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

describe('[Category Entity]', () => {
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

    it('should throw an error if name is an empty string', () => {
      // Arrange
      const emptyName = '';

      // Act & Assert
      expect(() => {
        new Category({ name: emptyName });
      }).toThrow();
    });

    it('should throw an error if name is undefined', () => {
      // Arrange
      const name = undefined as any;

      // Act & Assert
      expect(() => {
        new Category({ name });
      }).toThrow();
    });

    it('should throw an error if name is null', () => {
      // Arrange
      const name = null as any;

      // Act & Assert
      expect(() => {
        new Category({ name });
      }).toThrow();
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
    });

    it('should create a category using factory method with minimum fields', () => {
      // Arrange
      const name = 'Category Test';

      // Act
      const category = Category.create({ name });

      // Assert
      expect(category).toBeInstanceOf(Category);
      expect(category.name).toBe(name);
    });

    it('should set is_active to true by default', () => {
      // Arrange
      const name = 'Category Test';

      // Act
      const category = Category.create({ name });

      // Assert
      expect(category.is_active).toBe(true);
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
    });

    it('should throw an error if name is invalid', () => {
      // Arrange
      const name = '' as any;

      // Act & Assert
      expect(() => {
        Category.create({ name });
      }).toThrow();
    });
  });

  describe('[changeName]', () => {
    it('should change the category name', () => {
      // Arrange
      const category = new Category({ name: 'Original Name' });
      const newName = 'Updated Name';

      // Act
      category.changeName(newName);

      // Assert
      expect(category.name).toBe(newName);
    });

    it('should accept any valid string as name', () => {
      // Arrange
      const category = new Category({ name: 'Original Name' });
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
    });

    it('should allow changing multiple times', () => {
      // Arrange
      const category = new Category({ name: 'Original Name' });
      const firstChange = 'First Change';
      const secondChange = 'Second Change';

      // Act
      category.changeName(firstChange);
      category.changeName(secondChange);

      // Assert
      expect(category.name).toBe(secondChange);
    });

    it('should throw an error if name is an empty string', () => {
      // Arrange
      const category = new Category({ name: 'Original Name' });
      const emptyName = '';

      // Act & Assert
      expect(() => {
        category.changeName(emptyName);
      }).toThrow();
    });

    it('should throw an error if name is undefined', () => {
      // Arrange
      const category = new Category({ name: 'Original Name' });
      const name = undefined as any;

      // Act & Assert
      expect(() => {
        category.changeName(name);
      }).toThrow();
    });

    it('should throw an error if name is null', () => {
      // Arrange
      const category = new Category({ name: 'Original Name' });
      const name = null as any;

      // Act & Assert
      expect(() => {
        category.changeName(name);
      }).toThrow();
    });
  });

  describe('[changeDescription]', () => {
    it('should change the category description', () => {
      // Arrange
      const category = new Category({ name: 'Test' });
      const newDescription = 'Updated Description';

      // Act
      category.changeDescription(newDescription);

      // Assert
      expect(category.description).toBe(newDescription);
    });

    it('should allow empty description', () => {
      // Arrange
      const category = new Category({ name: 'Test' });
      const emptyDescription = '';

      // Act
      category.changeDescription(emptyDescription);

      // Assert
      expect(category.description).toBe(emptyDescription);
    });

    it('should allow changing multiple times', () => {
      // Arrange
      const category = new Category({ name: 'Test' });
      const firstChange = 'First Description';
      const secondChange = 'Second Description';

      // Act
      category.changeDescription(firstChange);
      category.changeDescription(secondChange);

      // Assert
      expect(category.description).toBe(secondChange);
    });
  });

  describe('[activate]', () => {
    it('should set is_active to true', () => {
      // Arrange
      const category = new Category({ name: 'Test', is_active: false });

      // Act
      category.activate();

      // Assert
      expect(category.is_active).toBe(true);
    });

    it('should keep as true if already active', () => {
      // Arrange
      const category = new Category({ name: 'Test', is_active: true });

      // Act
      category.activate();

      // Assert
      expect(category.is_active).toBe(true);
    });
  });

  describe('[deactivate]', () => {
    it('should set is_active to false', () => {
      // Arrange
      const category = new Category({ name: 'Test', is_active: true });

      // Act
      category.deactivate();

      // Assert
      expect(category.is_active).toBe(false);
    });

    it('should keep as false if already inactive', () => {
      // Arrange
      const category = new Category({ name: 'Test', is_active: false });

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
      const category = new Category({ name: 'Test' });

      // Act
      const json = category.toJSON();

      // Assert
      expect(typeof json.name).toBe('string');
      expect(typeof json.is_active).toBe('boolean');
      expect(json.created_at).toBeInstanceOf(Date);
    });

    it('should include id as string in JSON and description as null', () => {
      // Arrange
      const category = new Category({ name: 'Test' });

      // Act
      const json = category.toJSON();

      // Assert
      expect(typeof json.id).toBe('string');
      expect(json.description).toBeNull(); // description defaults to null
    });
  });

  describe('[integrated behaviors]', () => {
    it('should create an inactive category and then activate it', () => {
      // Arrange
      const name = 'Test Category';

      // Act
      const category = new Category({ name, is_active: false });
      category.activate();

      // Assert
      expect(category.is_active).toBe(true);
      expect(category.name).toBe(name);
    });

    it('should change name and description in sequence', () => {
      // Arrange
      const category = new Category({
        name: 'Original Name',
        description: 'Original Description',
      });
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
      const category = new Category({ name: 'Original', is_active: true });

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

  describe('[UUID integration behavior]', () => {
    it('should generate a Uuid instance when id is not provided', () => {
      // Arrange
      const name = 'Category Test';

      // Act
      const category = new Category({ name });

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
      const category = new Category({ id: customUuid, name });

      // Assert
      expect(category.id).toBe(customUuid);
      expect(category.id.value).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should throw InvalidUuidError when trying to create Uuid with invalid string', () => {
      // Arrange & Act & Assert
      expect(() => {
        // This will throw during Uuid construction
        new Uuid('invalid-uuid-string');
      }).toThrow(InvalidUuidError);
    });

    it('should throw InvalidUuidError when creating Uuid with invalid string and using it in Category', () => {
      // Arrange
      const name = 'Category Test';

      // Act & Assert
      expect(() => {
        // This will throw during Uuid construction, before Category is created
        const invalidUuid = new Uuid('not-a-valid-uuid');
        new Category({ id: invalidUuid, name });
      }).toThrow(InvalidUuidError);
    });

    it('should have different UUIDs generated for each category created without id', () => {
      // Arrange
      const name1 = 'Category 1';
      const name2 = 'Category 2';

      // Act
      const category1 = new Category({ name: name1 });
      const category2 = new Category({ name: name2 });

      // Assert
      expect(category1.id).toBeInstanceOf(Uuid);
      expect(category2.id).toBeInstanceOf(Uuid);
      expect(category1.id.value).not.toBe(category2.id.value);
    });
  });
});
