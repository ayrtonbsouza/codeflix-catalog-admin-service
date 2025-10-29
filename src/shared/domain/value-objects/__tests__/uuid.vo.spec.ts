import { Uuid, InvalidUuidError } from '@/shared/domain/value-objects/uuid.vo';
import { validate as uuidValidate } from 'uuid';

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

describe('[Uuid Value Object]', () => {
  beforeEach(() => {
    callCount = 0;
    jest.clearAllMocks();
  });

  describe('[constructor]', () => {
    it('should create a UUID without parameter (generates automatically)', () => {
      // Arrange & Act
      const uuid = new Uuid();

      // Assert
      expect(uuid.value).toBeDefined();
      expect(typeof uuid.value).toBe('string');
      expect(uuidValidate).toHaveBeenCalledTimes(1);
      expect(uuidValidate).toHaveBeenCalledWith(uuid.value);
    });

    it('should create a UUID with a valid UUID string', () => {
      // Arrange
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';

      // Act
      const uuid = new Uuid(validUuid);

      // Assert
      expect(uuid.value).toBe(validUuid);
      expect(uuidValidate).toHaveBeenCalledTimes(1);
      expect(uuidValidate).toHaveBeenCalledWith(validUuid);
    });

    it('should throw InvalidUuidError when UUID is invalid (random string)', () => {
      // Arrange
      const invalidUuid = 'invalid-uuid-string';

      // Act & Assert
      expect(() => {
        new Uuid(invalidUuid);
      }).toThrow(InvalidUuidError);
      expect(uuidValidate).toHaveBeenCalledWith(invalidUuid);
      expect(uuidValidate).toHaveBeenCalledTimes(1);
    });

    it('should throw InvalidUuidError when UUID has incorrect format (missing hyphens)', () => {
      // Arrange
      const invalidUuid = '123e4567e89b12d3a456426614174000';

      // Act & Assert
      expect(() => {
        new Uuid(invalidUuid);
      }).toThrow(InvalidUuidError);
    });

    it('should throw InvalidUuidError when UUID has too many characters', () => {
      // Arrange
      const invalidUuid = '123e4567-e89b-12d3-a456-4266141740000';

      // Act & Assert
      expect(() => {
        new Uuid(invalidUuid);
      }).toThrow(InvalidUuidError);
    });

    it('should throw InvalidUuidError when UUID has too few characters', () => {
      // Arrange
      const invalidUuid = '123e4567-e89b-12d3-a456-42661417400';

      // Act & Assert
      expect(() => {
        new Uuid(invalidUuid);
      }).toThrow(InvalidUuidError);
    });

    it('should generate UUID automatically when empty string is provided', () => {
      // Arrange
      const emptyString = '';

      // Act
      const uuid = new Uuid(emptyString);

      // Assert
      expect(uuid.value).toBeDefined();
      expect(typeof uuid.value).toBe('string');
      expect(uuidValidate(uuid.value)).toBe(true);
    });

    it('should throw InvalidUuidError when UUID has invalid characters', () => {
      // Arrange
      const invalidUuid = '123g4567-e89b-12d3-a456-426614174000';

      // Act & Assert
      expect(() => {
        new Uuid(invalidUuid);
      }).toThrow(InvalidUuidError);
    });

    it('should accept UUID v1 format', () => {
      // Arrange
      const validUuidV1 = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

      // Act
      const uuid = new Uuid(validUuidV1);

      // Assert
      expect(uuid.value).toBe(validUuidV1);
      expect(uuidValidate(uuid.value)).toBe(true);
    });

    it('should accept UUID v4 format', () => {
      // Arrange
      const validUuidV4 = '550e8400-e29b-41d4-a716-446655440000';

      // Act
      const uuid = new Uuid(validUuidV4);

      // Assert
      expect(uuid.value).toBe(validUuidV4);
      expect(uuidValidate(uuid.value)).toBe(true);
    });

    it('should generate different UUIDs when called multiple times without parameter', () => {
      // Arrange & Act
      const uuid1 = new Uuid();
      const uuid2 = new Uuid();
      const uuid3 = new Uuid();

      // Assert
      expect(uuid1.value).not.toBe(uuid2.value);
      expect(uuid1.value).not.toBe(uuid3.value);
      expect(uuid2.value).not.toBe(uuid3.value);
    });

    it('should call uuid.validate exactly once when creating a UUID', () => {
      // Arrange
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';

      // Act
      new Uuid(validUuid);

      // Assert
      expect(uuidValidate).toHaveBeenCalledTimes(1);
      expect(uuidValidate).toHaveBeenCalledWith(validUuid);
    });

    it('should call uuid.validate for both generated and provided UUIDs', () => {
      // Arrange
      const providedUuid = '550e8400-e29b-41d4-a716-446655440000';

      // Act
      new Uuid();
      new Uuid(providedUuid);

      // Assert
      expect(uuidValidate).toHaveBeenCalledTimes(2);
    });
  });

  describe('[equals]', () => {
    it('should return true when comparing two UUIDs with the same value', () => {
      // Arrange
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const uuid1 = new Uuid(validUuid);
      const uuid2 = new Uuid(validUuid);

      // Act
      const result = uuid1.equals(uuid2);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when comparing two UUIDs with different values', () => {
      // Arrange
      const uuid1 = new Uuid('123e4567-e89b-12d3-a456-426614174000');
      const uuid2 = new Uuid('550e8400-e29b-41d4-a716-446655440000');

      // Act
      const result = uuid1.equals(uuid2);

      // Assert
      expect(result).toBe(false);
    });

    it('should return true when comparing UUID with itself', () => {
      // Arrange
      const uuid = new Uuid();

      // Act
      const result = uuid.equals(uuid);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when comparing with null', () => {
      // Arrange
      const uuid = new Uuid();

      // Act
      const result = uuid.equals(null as any);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when comparing with undefined', () => {
      // Arrange
      const uuid = new Uuid();

      // Act
      const result = uuid.equals(undefined as any);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('[toString]', () => {
    it('should return the UUID string value', () => {
      // Arrange
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';

      // Act
      const uuid = new Uuid(validUuid);

      // Assert
      expect(uuid.toString()).toBe(validUuid);
      expect(typeof uuid.toString()).toBe('string');
    });

    it('should return the same value as the value property', () => {
      // Arrange
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';

      // Act
      const uuid = new Uuid(validUuid);

      // Assert
      expect(uuid.toString()).toBe(uuid.value);
    });

    it('should return a valid UUID string when generated automatically', () => {
      // Arrange & Act
      const uuid = new Uuid();

      // Assert
      expect(uuid.toString()).toBeDefined();
      expect(typeof uuid.toString()).toBe('string');
      expect(uuidValidate(uuid.toString())).toBe(true);
    });

    it('should return different values for different UUID instances', () => {
      // Arrange & Act
      const uuid1 = new Uuid();
      const uuid2 = new Uuid();

      // Assert
      expect(uuid1.toString()).not.toBe(uuid2.toString());
    });

    it('should return the exact same value on multiple calls', () => {
      // Arrange
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';

      // Act
      const uuid = new Uuid(validUuid);

      // Assert
      expect(uuid.toString()).toBe(validUuid);
      expect(uuid.toString()).toBe(validUuid);
      expect(uuid.toString()).toBe(validUuid);
    });
  });

  describe('[value]', () => {
    it('should return the UUID string value', () => {
      // Arrange
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';

      // Act
      const uuid = new Uuid(validUuid);

      // Assert
      expect(uuid.value).toBe(validUuid);
      expect(typeof uuid.value).toBe('string');
    });

    it('should have a readonly value property (TypeScript compile-time check)', () => {
      // Arrange
      const uuid = new Uuid('123e4567-e89b-12d3-a456-426614174000');

      // Act & Assert
      const originalValue = uuid.value;
      (uuid as any).value = 'new-value';
      expect(typeof uuid.value).toBe('string');
    });
  });

  describe('[InvalidUuidError]', () => {
    it('should have correct error name', () => {
      // Arrange & Act
      const error = new InvalidUuidError();

      // Assert
      expect(error.name).toBe('InvalidUuidError');
    });

    it('should have default error message when no message is provided', () => {
      // Arrange & Act
      const error = new InvalidUuidError();

      // Assert
      expect(error.message).toBe('value must be a valid UUID');
    });

    it('should accept custom error message', () => {
      // Arrange
      const customMessage = 'Custom error message';

      // Act
      const error = new InvalidUuidError(customMessage);

      // Assert
      expect(error.message).toBe(customMessage);
    });

    it('should be an instance of Error', () => {
      // Arrange & Act
      const error = new InvalidUuidError();

      // Assert
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('[integrated behaviors]', () => {
    it('should create multiple UUIDs and compare them correctly', () => {
      // Arrange
      const validUuid1 = '123e4567-e89b-12d3-a456-426614174000';
      const validUuid2 = '123e4567-e89b-12d3-a456-426614174000';
      const validUuid3 = '550e8400-e29b-41d4-a716-446655440000';

      // Act
      const uuid1 = new Uuid(validUuid1);
      const uuid2 = new Uuid(validUuid2);
      const uuid3 = new Uuid(validUuid3);

      // Assert
      expect(uuid1.equals(uuid2)).toBe(true);
      expect(uuid1.equals(uuid3)).toBe(false);
      expect(uuid2.equals(uuid3)).toBe(false);
    });

    it('should generate valid UUID and compare with another instance', () => {
      // Arrange
      const uuid = new Uuid();
      const sameValue = uuid.value;

      // Act
      const anotherUuid = new Uuid(sameValue);

      // Assert
      expect(uuid.equals(anotherUuid)).toBe(true);
    });

    it('should throw error on invalid input and allow creation with valid input after', () => {
      // Arrange
      const invalidUuid = 'invalid';
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';

      // Act & Assert
      expect(() => {
        new Uuid(invalidUuid);
      }).toThrow(InvalidUuidError);

      const uuid = new Uuid(validUuid);
      expect(uuid.value).toBe(validUuid);
    });
  });
});
