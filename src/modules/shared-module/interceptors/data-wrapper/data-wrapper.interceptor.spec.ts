import { DataWrapperInterceptor } from './data-wrapper.interceptor';
import type { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { firstValueFrom } from 'rxjs';

describe('Unit: [DataWrapperInterceptor]', () => {
  let interceptor: DataWrapperInterceptor;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  beforeEach(() => {
    interceptor = new DataWrapperInterceptor();
    mockExecutionContext = {} as ExecutionContext;
    mockCallHandler = {
      handle: jest.fn(),
    } as unknown as CallHandler;
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('[intercept]', () => {
    it('should wrap body in data property when body is a plain object', async () => {
      // Arrange
      const body = { id: 1, name: 'Test' };
      jest.spyOn(mockCallHandler, 'handle').mockReturnValue(of(body));

      // Act
      const result = await firstValueFrom(
        interceptor.intercept(mockExecutionContext, mockCallHandler),
      );

      // Assert
      expect(result).toEqual({ data: body });
    });

    it('should wrap body in data property when body is an array', async () => {
      // Arrange
      const body = [{ id: 1 }, { id: 2 }];
      jest.spyOn(mockCallHandler, 'handle').mockReturnValue(of(body));

      // Act
      const result = await firstValueFrom(
        interceptor.intercept(mockExecutionContext, mockCallHandler),
      );

      // Assert
      expect(result).toEqual({ data: body });
    });

    it('should wrap body in data property when body is an empty object', async () => {
      // Arrange
      const body = {};
      jest.spyOn(mockCallHandler, 'handle').mockReturnValue(of(body));

      // Act
      const result = await firstValueFrom(
        interceptor.intercept(mockExecutionContext, mockCallHandler),
      );

      // Assert
      expect(result).toEqual({ data: body });
    });

    it('should not wrap body when body is null', async () => {
      // Arrange
      const body = null;
      jest.spyOn(mockCallHandler, 'handle').mockReturnValue(of(body));

      // Act
      const result = await firstValueFrom(
        interceptor.intercept(mockExecutionContext, mockCallHandler),
      );

      // Assert
      expect(result).toBeNull();
    });

    it('should not wrap body when body is undefined', async () => {
      // Arrange
      const body = undefined;
      jest.spyOn(mockCallHandler, 'handle').mockReturnValue(of(body));

      // Act
      const result = await firstValueFrom(
        interceptor.intercept(mockExecutionContext, mockCallHandler),
      );

      // Assert
      expect(result).toBeUndefined();
    });

    it('should not wrap body when body already has meta property', async () => {
      // Arrange
      const body = { meta: { total: 10 }, items: [] };
      jest.spyOn(mockCallHandler, 'handle').mockReturnValue(of(body));

      // Act
      const result = await firstValueFrom(
        interceptor.intercept(mockExecutionContext, mockCallHandler),
      );

      // Assert
      expect(result).toEqual(body);
      expect(result).not.toHaveProperty('data');
    });

    it('should not wrap body when body has meta property with nested structure', async () => {
      // Arrange
      const body = {
        meta: { page: 1, limit: 10 },
        data: [{ id: 1 }],
      };
      jest.spyOn(mockCallHandler, 'handle').mockReturnValue(of(body));

      // Act
      const result = await firstValueFrom(
        interceptor.intercept(mockExecutionContext, mockCallHandler),
      );

      // Assert
      expect(result).toEqual(body);
    });
  });
});
