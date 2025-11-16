import { ValueObject } from '@core/shared/domain/entities/value-object';

class StringValueObject extends ValueObject {
  constructor(readonly value: string) {
    super();
  }
}

class NumberValueObject extends ValueObject {
  constructor(readonly value: number) {
    super();
  }
}

class ComplexValueObject extends ValueObject {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly metadata: Record<string, unknown>,
  ) {
    super();
  }
}

describe('Unit: [Value Object Abstract Class]', () => {
  describe('[equals]', () => {
    it('should return true when objects are equal (same class and same properties)', () => {
      // Arrange
      const vo1 = new StringValueObject('test');
      const vo2 = new StringValueObject('test');

      // Act
      const result = vo1.equals(vo2);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when objects have different properties', () => {
      // Arrange
      const vo1 = new StringValueObject('test1');
      const vo2 = new StringValueObject('test2');

      // Act
      const result = vo1.equals(vo2);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when the compared object is null', () => {
      // Arrange
      const vo1 = new StringValueObject('test');

      // Act
      const result = vo1.equals(null as any);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when the compared object is undefined', () => {
      // Arrange
      const vo1 = new StringValueObject('test');

      // Act
      const result = vo1.equals(undefined as any);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when comparing instances of different classes', () => {
      // Arrange
      const vo1 = new StringValueObject('test');
      const vo2 = new NumberValueObject(123);

      // Act
      const result = vo1.equals(vo2 as any);

      // Assert
      expect(result).toBe(false);
    });

    it('should return true for complex objects with equal nested properties', () => {
      // Arrange
      const metadata = { type: 'user', active: true };
      const vo1 = new ComplexValueObject('123', 'John Doe', metadata);
      const vo2 = new ComplexValueObject('123', 'John Doe', metadata);

      // Act
      const result = vo1.equals(vo2);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for complex objects with different nested properties', () => {
      // Arrange
      const metadata1 = { type: 'user', active: true };
      const metadata2 = { type: 'admin', active: true };
      const vo1 = new ComplexValueObject('123', 'John Doe', metadata1);
      const vo2 = new ComplexValueObject('123', 'John Doe', metadata2);

      // Act
      const result = vo1.equals(vo2);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when at least one property is different', () => {
      // Arrange
      const metadata = { type: 'user', active: true };
      const vo1 = new ComplexValueObject('123', 'John Doe', metadata);
      const vo2 = new ComplexValueObject('456', 'John Doe', metadata);

      // Act
      const result = vo1.equals(vo2);

      // Assert
      expect(result).toBe(false);
    });

    it('should return true when comparing object with itself', () => {
      // Arrange
      const vo1 = new StringValueObject('test');

      // Act
      const result = vo1.equals(vo1);

      // Assert
      expect(result).toBe(true);
    });

    it('should handle arrays correctly', () => {
      // Arrange
      class ArrayValueObject extends ValueObject {
        constructor(readonly items: string[]) {
          super();
        }
      }
      const vo1 = new ArrayValueObject(['item1', 'item2']);
      const vo2 = new ArrayValueObject(['item1', 'item2']);
      const vo3 = new ArrayValueObject(['item1', 'item3']);

      // Act
      const result1 = vo1.equals(vo2);
      const result2 = vo1.equals(vo3);

      // Assert
      expect(result1).toBe(true);
      expect(result2).toBe(false);
    });

    it('should return false for objects with different primitive types but equivalent values', () => {
      // Arrange
      const vo1 = new StringValueObject('123');
      const vo2 = new NumberValueObject(123);

      // Act
      const result = vo1.equals(vo2 as any);

      // Assert
      expect(result).toBe(false);
    });
  });
});
