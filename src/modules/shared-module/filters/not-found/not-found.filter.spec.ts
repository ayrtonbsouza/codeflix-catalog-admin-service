import { NotFoundFilter } from './not-found.filter';
import { NotFoundError } from '@/core/shared/domain/errors/not-found.error';
import type { ArgumentsHost } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { Entity } from '@/core/shared/domain/entities/entity';
import type { ValueObject } from '@/core/shared/domain/entities/value-object';
import { Uuid } from '@/core/shared/domain/value-objects/uuid.vo';

class MockEntity extends Entity {
  id: Uuid;

  constructor(id?: Uuid) {
    super();
    this.id = id ?? new Uuid();
  }

  get entity_id(): ValueObject {
    return this.id;
  }

  toJSON() {
    return {
      id: this.id.value,
    };
  }
}

class TestEntity extends Entity {
  id: Uuid;

  constructor(id?: Uuid) {
    super();
    this.id = id ?? new Uuid();
  }

  get entity_id(): ValueObject {
    return this.id;
  }

  toJSON() {
    return {
      id: this.id.value,
    };
  }
}

describe('Unit: [NotFoundFilter]', () => {
  let filter: NotFoundFilter;
  let mockArgumentsHost: ArgumentsHost;
  let mockResponse: {
    status: jest.Mock;
    json: jest.Mock;
  };

  beforeEach(() => {
    filter = new NotFoundFilter();
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
    it('should return 404 status with correct error structure', () => {
      // Arrange
      const exception = new NotFoundError('123', MockEntity);

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.NOT_FOUND,
        message: exception.message,
        error: 'Not Found',
      });
    });

    it('should use the exception message in the response', () => {
      // Arrange
      const exception = new NotFoundError('456', TestEntity);

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: exception.message,
        }),
      );
    });

    it('should handle NotFoundError with array of ids', () => {
      // Arrange
      const exception = new NotFoundError(['1', '2', '3'], TestEntity);

      // Act
      filter.catch(exception, mockArgumentsHost);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.NOT_FOUND,
        message: exception.message,
        error: 'Not Found',
      });
    });

    it('should switch to HTTP context correctly', () => {
      // Arrange
      const exception = new NotFoundError('789', TestEntity);
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
      const exception = new NotFoundError('999', TestEntity);
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
  });
});
