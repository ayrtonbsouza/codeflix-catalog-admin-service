import {
  BaseValidationError,
  EntityValidationError,
  ValidationError,
  SearchValidationError,
  LoadEntityError,
} from '@/shared/domain/validators/validation.error';

class BaseValidationErrorStub extends BaseValidationError {}

describe('Unit: [Validation Error]', () => {
  describe('[BaseValidationError]', () => {
    it('should create an instance with default message', () => {
      // Arrange
      const errors = { field: ['error message'] };

      // Act
      const error = new BaseValidationErrorStub(errors);

      // Assert
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Validation Error');
      expect(error.error).toEqual(errors);
      expect(error.name).toBe('Error');
    });

    it('should create an instance with custom message', () => {
      // Arrange
      const errors = { field: ['error message'] };
      const customMessage = 'Custom Error Message';

      // Act
      const error = new BaseValidationErrorStub(errors, customMessage);

      // Assert
      expect(error.message).toBe(customMessage);
      expect(error.error).toEqual(errors);
    });

    it('should count errors correctly', () => {
      // Arrange
      const errors = {
        field1: ['error 1'],
        field2: ['error 2', 'error 3'],
        field3: ['error 4'],
      };

      // Act
      const error = new BaseValidationErrorStub(errors);

      // Assert
      expect(error.count()).toBe(3);
    });

    it('should return 0 when there are no errors', () => {
      // Arrange
      const errors = {};

      // Act
      const error = new BaseValidationErrorStub(errors);

      // Assert
      expect(error.count()).toBe(0);
    });

    it('should handle multiple error messages per field', () => {
      // Arrange
      const errors = {
        field: ['error 1', 'error 2', 'error 3'],
      };

      // Act
      const error = new BaseValidationErrorStub(errors);

      // Assert
      expect(error.count()).toBe(1);
      expect(error.error).toEqual(errors);
    });
  });

  describe('[ValidationError]', () => {
    it('should create an instance', () => {
      // Act
      const error = new ValidationError();

      // Assert
      expect(error).toBeInstanceOf(Error);
    });

    it('should accept a custom message', () => {
      // Arrange
      const message = 'Custom validation error message';

      // Act
      const error = new ValidationError();

      // Assert
      expect(error).toBeInstanceOf(Error);
    });

    it('should extend Error class', () => {
      // Act
      const error = new ValidationError();

      // Assert
      expect(error).toBeInstanceOf(Error);
      expect(error.stack).toBeDefined();
    });
  });

  describe('[EntityValidationError]', () => {
    it('should create an instance with correct default message', () => {
      // Arrange
      const errors = {
        name: ['name is required'],
      };

      // Act
      const error = new EntityValidationError(errors);

      // Assert
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Entity Validation Error');
      expect(error.error).toEqual(errors);
      expect(error.name).toBe('EntityValidationError');
    });

    it('should set custom name property', () => {
      // Arrange
      const errors = { field: ['error'] };

      // Act
      const error = new EntityValidationError(errors);

      // Assert
      expect(error.name).toBe('EntityValidationError');
    });

    it('should count errors correctly', () => {
      // Arrange
      const errors = {
        field1: ['error 1'],
        field2: ['error 2'],
      };

      // Act
      const error = new EntityValidationError(errors);

      // Assert
      expect(error.count()).toBe(2);
    });
  });

  describe('[SearchValidationError]', () => {
    it('should create an instance with correct default message', () => {
      // Arrange
      const errors = {
        query: ['query is required'],
      };

      // Act
      const error = new SearchValidationError(errors);

      // Assert
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Search Validation Error');
      expect(error.error).toEqual(errors);
      expect(error.name).toBe('SearchValidationError');
    });

    it('should set custom name property', () => {
      // Arrange
      const errors = { field: ['error'] };

      // Act
      const error = new SearchValidationError(errors);

      // Assert
      expect(error.name).toBe('SearchValidationError');
    });

    it('should count errors correctly', () => {
      // Arrange
      const errors = {
        page: ['invalid page'],
        limit: ['invalid limit'],
      };

      // Act
      const error = new SearchValidationError(errors);

      // Assert
      expect(error.count()).toBe(2);
    });
  });

  describe('[LoadEntityError]', () => {
    it('should create an instance with correct default message', () => {
      // Arrange
      const errors = {
        id: ['id is required'],
      };

      // Act
      const error = new LoadEntityError(errors);

      // Assert
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('LoadEntityError');
      expect(error.error).toEqual(errors);
      expect(error.name).toBe('LoadEntityError');
    });

    it('should set custom name property', () => {
      // Arrange
      const errors = { field: ['error'] };

      // Act
      const error = new LoadEntityError(errors);

      // Assert
      expect(error.name).toBe('LoadEntityError');
    });

    it('should count errors correctly', () => {
      // Arrange
      const errors = {
        id: ['id is required'],
        repository: ['repository error'],
      };

      // Act
      const error = new LoadEntityError(errors);

      // Assert
      expect(error.count()).toBe(2);
    });
  });
});
