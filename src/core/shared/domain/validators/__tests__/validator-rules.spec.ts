import {
  ValidatorRules,
  isEmpty,
} from '@core/shared/domain/validators/validator-rules';
import { ValidationError } from '@core/shared/domain/validators/validation.error';

describe('Unit: [ValidatorRules]', () => {
  describe('[values]', () => {
    it('should create an instance with value and property', () => {
      // Arrange
      const value = 'test';
      const property = 'name';

      // Act
      const validator = ValidatorRules.values(value, property);

      // Assert
      expect(validator).toBeInstanceOf(ValidatorRules);
    });
  });

  describe('[required]', () => {
    it('should pass when value is a valid string', () => {
      // Arrange
      const value = 'test';
      const property = 'name';

      // Act & Assert
      expect(() => {
        ValidatorRules.values(value, property).required();
      }).not.toThrow();
    });

    it('should throw ValidationError when value is null', () => {
      // Arrange
      const value: null = null;
      const property = 'name';

      // Act & Assert
      expect(() => {
        ValidatorRules.values(value, property).required();
      }).toThrow(ValidationError);
      expect(() => {
        ValidatorRules.values(value, property).required();
      }).toThrow('The name is required');
    });

    it('should throw ValidationError when value is undefined', () => {
      // Arrange
      const value: undefined = undefined;
      const property = 'name';

      // Act & Assert
      expect(() => {
        ValidatorRules.values(value, property).required();
      }).toThrow(ValidationError);
      expect(() => {
        ValidatorRules.values(value, property).required();
      }).toThrow('The name is required');
    });

    it('should throw ValidationError when value is empty string', () => {
      // Arrange
      const value = '';
      const property = 'name';

      // Act & Assert
      expect(() => {
        ValidatorRules.values(value, property).required();
      }).toThrow(ValidationError);
      expect(() => {
        ValidatorRules.values(value, property).required();
      }).toThrow('The name is required');
    });

    it('should return the same instance after calling required', () => {
      // Arrange
      const value = 'test';
      const property = 'name';

      // Act
      const result = ValidatorRules.values(value, property).required();

      // Assert
      expect(result).toBeInstanceOf(ValidatorRules);
    });
  });

  describe('[string]', () => {
    it('should pass when value is a string', () => {
      // Arrange
      const value = 'test';
      const property = 'name';

      // Act & Assert
      expect(() => {
        ValidatorRules.values(value, property).string();
      }).not.toThrow();
    });

    it('should pass when value is null (empty values should not be validated)', () => {
      // Arrange
      const value: null = null;
      const property = 'name';

      // Act & Assert
      expect(() => {
        ValidatorRules.values(value, property).string();
      }).not.toThrow();
    });

    it('should pass when value is undefined (empty values should not be validated)', () => {
      // Arrange
      const value: undefined = undefined;
      const property = 'name';

      // Act & Assert
      expect(() => {
        ValidatorRules.values(value, property).string();
      }).not.toThrow();
    });

    it('should throw ValidationError when value is a number', () => {
      // Arrange
      const value = 123;
      const property = 'name';

      // Act & Assert
      expect(() => {
        ValidatorRules.values(value, property).string();
      }).toThrow(ValidationError);
      expect(() => {
        ValidatorRules.values(value, property).string();
      }).toThrow('The name must be a string');
    });

    it('should throw ValidationError when value is an object', () => {
      // Arrange
      const value = { test: 'value' };
      const property = 'name';

      // Act & Assert
      expect(() => {
        ValidatorRules.values(value, property).string();
      }).toThrow(ValidationError);
      expect(() => {
        ValidatorRules.values(value, property).string();
      }).toThrow('The name must be a string');
    });

    it('should throw ValidationError when value is a boolean', () => {
      // Arrange
      const value = true;
      const property = 'name';

      // Act & Assert
      expect(() => {
        ValidatorRules.values(value, property).string();
      }).toThrow(ValidationError);
      expect(() => {
        ValidatorRules.values(value, property).string();
      }).toThrow('The name must be a string');
    });

    it('should return the same instance after calling string', () => {
      // Arrange
      const value = 'test';
      const property = 'name';

      // Act
      const result = ValidatorRules.values(value, property).string();

      // Assert
      expect(result).toBeInstanceOf(ValidatorRules);
    });
  });

  describe('[maxLength]', () => {
    it('should pass when string length is less than max', () => {
      // Arrange
      const value = 'test';
      const max = 10;
      const property = 'name';

      // Act & Assert
      expect(() => {
        ValidatorRules.values(value, property).maxLength(max);
      }).not.toThrow();
    });

    it('should pass when string length equals max', () => {
      // Arrange
      const value = 'test';
      const max = 4;
      const property = 'name';

      // Act & Assert
      expect(() => {
        ValidatorRules.values(value, property).maxLength(max);
      }).not.toThrow();
    });

    it('should throw ValidationError when string length exceeds max', () => {
      // Arrange
      const value = 'test';
      const max = 3;
      const property = 'name';

      // Act & Assert
      expect(() => {
        ValidatorRules.values(value, property).maxLength(max);
      }).toThrow(ValidationError);
      expect(() => {
        ValidatorRules.values(value, property).maxLength(max);
      }).toThrow('The name must be less or equal than 3 characters');
    });

    it('should pass when value is null (empty values should not be validated)', () => {
      // Arrange
      const value: null = null;
      const max = 10;
      const property = 'name';

      // Act & Assert
      expect(() => {
        ValidatorRules.values(value, property).maxLength(max);
      }).not.toThrow();
    });

    it('should pass when value is undefined (empty values should not be validated)', () => {
      // Arrange
      const value: undefined = undefined;
      const max = 10;
      const property = 'name';

      // Act & Assert
      expect(() => {
        ValidatorRules.values(value, property).maxLength(max);
      }).not.toThrow();
    });

    it('should throw ValidationError when array length exceeds max', () => {
      // Arrange
      const value = [1, 2, 3, 4];
      const max = 3;
      const property = 'items';

      // Act & Assert
      expect(() => {
        ValidatorRules.values(value, property).maxLength(max);
      }).toThrow(ValidationError);
      expect(() => {
        ValidatorRules.values(value, property).maxLength(max);
      }).toThrow('The items must be less or equal than 3 characters');
    });

    it('should return the same instance after calling maxLength', () => {
      // Arrange
      const value = 'test';
      const max = 10;
      const property = 'name';

      // Act
      const result = ValidatorRules.values(value, property).maxLength(max);

      // Assert
      expect(result).toBeInstanceOf(ValidatorRules);
    });
  });

  describe('[boolean]', () => {
    it('should pass when value is true', () => {
      // Arrange
      const value = true;
      const property = 'is_active';

      // Act & Assert
      expect(() => {
        ValidatorRules.values(value, property).boolean();
      }).not.toThrow();
    });

    it('should pass when value is false', () => {
      // Arrange
      const value = false;
      const property = 'is_active';

      // Act & Assert
      expect(() => {
        ValidatorRules.values(value, property).boolean();
      }).not.toThrow();
    });

    it('should pass when value is null (empty values should not be validated)', () => {
      // Arrange
      const value: null = null;
      const property = 'is_active';

      // Act & Assert
      expect(() => {
        ValidatorRules.values(value, property).boolean();
      }).not.toThrow();
    });

    it('should pass when value is undefined (empty values should not be validated)', () => {
      // Arrange
      const value: undefined = undefined;
      const property = 'is_active';

      // Act & Assert
      expect(() => {
        ValidatorRules.values(value, property).boolean();
      }).not.toThrow();
    });

    it('should throw ValidationError when value is a string', () => {
      // Arrange
      const value = 'true';
      const property = 'is_active';

      // Act & Assert
      expect(() => {
        ValidatorRules.values(value, property).boolean();
      }).toThrow(ValidationError);
      expect(() => {
        ValidatorRules.values(value, property).boolean();
      }).toThrow('The is_active must be a boolean');
    });

    it('should throw ValidationError when value is a number', () => {
      // Arrange
      const value = 1;
      const property = 'is_active';

      // Act & Assert
      expect(() => {
        ValidatorRules.values(value, property).boolean();
      }).toThrow(ValidationError);
      expect(() => {
        ValidatorRules.values(value, property).boolean();
      }).toThrow('The is_active must be a boolean');
    });

    it('should throw ValidationError when value is an object', () => {
      // Arrange
      const value = {};
      const property = 'is_active';

      // Act & Assert
      expect(() => {
        ValidatorRules.values(value, property).boolean();
      }).toThrow(ValidationError);
      expect(() => {
        ValidatorRules.values(value, property).boolean();
      }).toThrow('The is_active must be a boolean');
    });

    it('should return the same instance after calling boolean', () => {
      // Arrange
      const value = true;
      const property = 'is_active';

      // Act
      const result = ValidatorRules.values(value, property).boolean();

      // Assert
      expect(result).toBeInstanceOf(ValidatorRules);
    });
  });

  describe('[method chaining]', () => {
    it('should allow chaining multiple validation methods', () => {
      // Arrange
      const value = 'test';
      const property = 'name';

      // Act & Assert
      expect(() => {
        ValidatorRules.values(value, property)
          .required()
          .string()
          .maxLength(10);
      }).not.toThrow();
    });

    it('should throw on first failure in chain', () => {
      // Arrange
      const value: null = null;
      const property = 'name';

      // Act & Assert
      expect(() => {
        ValidatorRules.values(value, property)
          .required()
          .string()
          .maxLength(10);
      }).toThrow(ValidationError);
      expect(() => {
        ValidatorRules.values(value, property)
          .required()
          .string()
          .maxLength(10);
      }).toThrow('The name is required');
    });

    it('should throw on second failure in chain', () => {
      // Arrange
      const value = 123;
      const property = 'name';

      // Act & Assert
      expect(() => {
        ValidatorRules.values(value, property).required().string();
      }).toThrow(ValidationError);
      expect(() => {
        ValidatorRules.values(value, property).required().string();
      }).toThrow('The name must be a string');
    });

    it('should throw on third failure in chain', () => {
      // Arrange
      const value = 'very long string';
      const property = 'name';

      // Act & Assert
      expect(() => {
        ValidatorRules.values(value, property).required().string().maxLength(5);
      }).toThrow(ValidationError);
      expect(() => {
        ValidatorRules.values(value, property).required().string().maxLength(5);
      }).toThrow('The name must be less or equal than 5 characters');
    });
  });

  describe('[edge cases]', () => {
    it('should handle empty string with maxLength', () => {
      // Arrange
      const value = '';
      const property = 'name';

      // Act & Assert
      expect(() => {
        ValidatorRules.values(value, property).maxLength(10);
      }).not.toThrow();
    });

    it('should handle zero maxLength', () => {
      // Arrange
      const value = 'test';
      const property = 'name';

      // Act & Assert
      expect(() => {
        ValidatorRules.values(value, property).maxLength(0);
      }).toThrow(ValidationError);
    });

    it('should handle property name with spaces', () => {
      // Arrange
      const value: null = null;
      const property = 'field name';

      // Act & Assert
      expect(() => {
        ValidatorRules.values(value, property).required();
      }).toThrow('The field name is required');
    });
  });
});

describe('[isEmpty function]', () => {
  it('should return true when value is undefined', () => {
    // Arrange
    const value: undefined = undefined;

    // Act
    const result = isEmpty(value);

    // Assert
    expect(result).toBe(true);
  });

  it('should return true when value is null', () => {
    // Arrange
    const value: null = null;

    // Act
    const result = isEmpty(value);

    // Assert
    expect(result).toBe(true);
  });

  it('should return false when value is an empty string', () => {
    // Arrange
    const value = '';

    // Act
    const result = isEmpty(value);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false when value is 0', () => {
    // Arrange
    const value = 0;

    // Act
    const result = isEmpty(value);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false when value is false', () => {
    // Arrange
    const value = false;

    // Act
    const result = isEmpty(value);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false when value is an object', () => {
    // Arrange
    const value = {};

    // Act
    const result = isEmpty(value);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false when value is an array', () => {
    // Arrange
    const value: unknown[] = [];

    // Act
    const result = isEmpty(value);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false when value is a non-empty string', () => {
    // Arrange
    const value = 'test';

    // Act
    const result = isEmpty(value);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false when value is a number', () => {
    // Arrange
    const value = 123;

    // Act
    const result = isEmpty(value);

    // Assert
    expect(result).toBe(false);
  });
});
