import { ClassValidatorFields } from '@/shared/domain/validators/class-validator-fields';

class TestDTO {
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}

class SimpleStub extends ClassValidatorFields<TestDTO> {}

describe('Unit: [ClassValidatorFields]', () => {
  let validator: SimpleStub;

  beforeEach(() => {
    validator = new SimpleStub();
  });

  describe('[IValidatorFields interface implementation]', () => {
    it('should implement IValidatorFields interface', () => {
      // Assert
      expect(validator).toHaveProperty('errors');
      expect(validator).toHaveProperty('validatedData');
      expect(validator).toHaveProperty('validate');
    });

    it('should have errors property initialized as null', () => {
      // Assert
      expect(validator.errors).toBeNull();
    });

    it('should have validatedData property initialized as null', () => {
      // Assert
      expect(validator.validatedData).toBeNull();
    });

    it('should have validate method', () => {
      // Assert
      expect(typeof validator.validate).toBe('function');
    });
  });

  describe('[validate - basic behavior]', () => {
    it('should execute validate method', () => {
      // Arrange
      const data = new TestDTO('test');

      // Act
      const result = validator.validate(data);

      // Assert
      expect(typeof result).toBe('boolean');
    });

    it('should handle null data', () => {
      // Arrange
      const data = null as any;

      // Act & Assert
      expect(() => validator.validate(data)).toThrow();
    });
  });

  describe('[abstract class behavior]', () => {
    it('should be usable through concrete implementation', () => {
      // Assert
      expect(validator).toBeInstanceOf(SimpleStub);
      expect(validator).toBeInstanceOf(ClassValidatorFields);
    });
  });
});
