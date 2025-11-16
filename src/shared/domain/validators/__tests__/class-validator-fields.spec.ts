import { ClassValidatorFields } from '@/shared/domain/validators/class-validator-fields';
import { Notification } from '@/shared/domain/validators/notification';

class TestDTO {
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}

class SimpleStub extends ClassValidatorFields {}

describe('Unit: [ClassValidatorFields]', () => {
  let validator: SimpleStub;

  beforeEach(() => {
    validator = new SimpleStub();
  });

  describe('[IValidatorFields interface implementation]', () => {
    it('should implement IValidatorFields interface', () => {
      // Assert
      expect(validator).toHaveProperty('validate');
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
      const notification = new Notification();

      // Act
      const result = validator.validate(notification, data, []);

      // Assert
      expect(typeof result).toBe('boolean');
    });

    it('should handle null data', () => {
      // Arrange
      const data = null as any;
      const notification = new Notification();

      // Act & Assert
      expect(() => validator.validate(notification, data, [])).toThrow();
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
