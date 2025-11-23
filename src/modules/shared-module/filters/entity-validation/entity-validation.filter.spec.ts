import { EntityValidationFilter } from './entity-validation.filter';
import { EntityValidationError } from '@/core/shared/domain/validators/validation.error';
import type { ArgumentsHost } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';

describe('Unit: [EntityValidationFilter]', () => {
  let filter: EntityValidationFilter;
  let mockArgumentsHost: ArgumentsHost;
  let mockResponse: {
    status: jest.Mock;
    json: jest.Mock;
  };

  beforeEach(() => {
    filter = new EntityValidationFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
      }),
    } as unknown as ArgumentsHost;
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('[catch]', () => {
    it('should return 422 status with correct error structure for string errors', () => {
      // Arrange
      const errors = ['Error message 1', 'Error message 2'];
      const exception = new EntityValidationError(errors);

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        error: 'Unprocessable Entity',
        message: ['Error message 1', 'Error message 2'],
      });
    });

    it('should return 422 status with correct error structure for object errors', () => {
      // Arrange
      const errors = [
        { name: ['name is required', 'name must be a string'] },
        { email: ['email is invalid'] },
      ];
      const exception = new EntityValidationError(errors);

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        error: 'Unprocessable Entity',
        message: [
          'name is required',
          'name must be a string',
          'email is invalid',
        ],
      });
    });

    it('should handle mixed string and object errors', () => {
      // Arrange
      const errors = [
        'Global error message',
        { field1: ['field1 error'] },
        { field2: ['field2 error 1', 'field2 error 2'] },
      ];
      const exception = new EntityValidationError(errors);

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        error: 'Unprocessable Entity',
        message: [
          'Global error message',
          'field1 error',
          'field2 error 1',
          'field2 error 2',
        ],
      });
    });

    it('should remove duplicate error messages using union', () => {
      // Arrange
      const errors = [
        'Duplicate error',
        { field: ['Duplicate error'] },
        'Duplicate error',
      ];
      const exception = new EntityValidationError(errors);

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        error: 'Unprocessable Entity',
        message: ['Duplicate error'],
      });
    });

    it('should handle empty errors array', () => {
      // Arrange
      const errors: Array<string | { [field: string]: string[] }> = [];
      const exception = new EntityValidationError(errors);

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        error: 'Unprocessable Entity',
        message: [],
      });
    });

    it('should switch to HTTP context correctly', () => {
      // Arrange
      const errors = [{ field: ['error'] }];
      const exception = new EntityValidationError(errors);
      const mockSwitchToHttp = jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
      });
      mockArgumentsHost.switchToHttp = mockSwitchToHttp;

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(mockSwitchToHttp).toHaveBeenCalledTimes(1);
    });

    it('should get response from HTTP context', () => {
      // Arrange
      const errors = [{ field: ['error'] }];
      const exception = new EntityValidationError(errors);
      const mockGetResponse = jest.fn().mockReturnValue(mockResponse);
      const mockHttpContext = {
        getResponse: mockGetResponse,
      };
      mockArgumentsHost.switchToHttp = jest
        .fn()
        .mockReturnValue(mockHttpContext);

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(mockGetResponse).toHaveBeenCalledTimes(1);
    });

    it('should handle complex nested error structures', () => {
      // Arrange
      const errors = [
        { name: ['name is required'] },
        { email: ['email is invalid', 'email must be unique'] },
        { age: ['age must be a number'] },
        'Global validation error',
      ];
      const exception = new EntityValidationError(errors);

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        error: 'Unprocessable Entity',
        message: [
          'name is required',
          'email is invalid',
          'email must be unique',
          'age must be a number',
          'Global validation error',
        ],
      });
    });
  });
});
