import { NestFactory, Reflector } from '@nestjs/core';
import {
  ValidationPipe,
  HttpStatus,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { AppModule } from '@/app.module';
import { DataWrapperInterceptor } from '@modules/shared-module/interceptors/data-wrapper/data-wrapper.interceptor';
import { NotFoundFilter } from '@modules/shared-module/filters/not-found/not-found.filter';
import { EntityValidationFilter } from '@modules/shared-module/filters/entity-validation/entity-validation.filter';

const mockUseGlobalPipes = jest.fn().mockReturnThis();
const mockUseGlobalInterceptors = jest.fn().mockReturnThis();
const mockUseGlobalFilters = jest.fn().mockReturnThis();
const mockListen = jest.fn().mockResolvedValue(undefined);
const mockGet = jest.fn();

const mockApp = {
  useGlobalPipes: mockUseGlobalPipes,
  useGlobalInterceptors: mockUseGlobalInterceptors,
  useGlobalFilters: mockUseGlobalFilters,
  listen: mockListen,
  get: mockGet,
};

jest.spyOn(NestFactory, 'create').mockResolvedValue(mockApp as any);

describe('Unit: [main]', () => {
  const mockReflector = {} as Reflector;
  let bootstrap: () => Promise<void>;

  beforeAll(async () => {
    const mainModule = await import('@/main');
    bootstrap = mainModule.bootstrap;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockReturnValue(mockReflector);
  });

  afterEach(() => {
    delete process.env.PORT;
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    // Assert
    expect(bootstrap).toBeDefined();
    expect(typeof bootstrap).toBe('function');
  });

  it('should be an async function', () => {
    // Act
    const result = bootstrap();

    // Assert
    expect(result).toBeInstanceOf(Promise);
  });

  it('should create NestJS application', async () => {
    // Act
    await bootstrap();

    // Assert
    expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
    expect(NestFactory.create).toHaveBeenCalledTimes(1);
  });

  it('should configure global validation pipe with correct error status', async () => {
    // Act
    await bootstrap();

    // Assert
    expect(mockUseGlobalPipes).toHaveBeenCalledTimes(1);
    const validationPipeCall = mockUseGlobalPipes.mock.calls[0][0];
    expect(validationPipeCall).toBeInstanceOf(ValidationPipe);
    expect(validationPipeCall.errorHttpStatusCode).toBe(
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  });

  it('should configure global interceptors with ClassSerializerInterceptor and DataWrapperInterceptor', async () => {
    // Act
    await bootstrap();

    // Assert
    expect(mockGet).toHaveBeenCalledWith(Reflector);
    expect(mockUseGlobalInterceptors).toHaveBeenCalledTimes(2);
    const firstInterceptorCall = mockUseGlobalInterceptors.mock.calls[0][0];
    const secondInterceptorCall = mockUseGlobalInterceptors.mock.calls[1][0];
    expect(firstInterceptorCall).toBeInstanceOf(ClassSerializerInterceptor);
    expect(secondInterceptorCall).toBeInstanceOf(DataWrapperInterceptor);
  });

  it('should configure global filters with NotFoundFilter and EntityValidationFilter', async () => {
    // Act
    await bootstrap();

    // Assert
    expect(mockUseGlobalFilters).toHaveBeenCalledTimes(1);
    const filtersCall = mockUseGlobalFilters.mock.calls[0];
    expect(filtersCall).toHaveLength(2);
    expect(filtersCall[0]).toBeInstanceOf(NotFoundFilter);
    expect(filtersCall[1]).toBeInstanceOf(EntityValidationFilter);
  });

  it('should listen on default port 3000 when PORT is not set', async () => {
    // Arrange
    delete process.env.PORT;

    // Act
    await bootstrap();

    // Assert
    expect(mockListen).toHaveBeenCalledWith(3000);
    expect(mockListen).toHaveBeenCalledTimes(1);
  });

  it('should listen on PORT from environment variable when set', async () => {
    // Arrange
    process.env.PORT = '8080';

    // Act
    await bootstrap();

    // Assert
    expect(mockListen).toHaveBeenCalledWith('8080');
    expect(mockListen).toHaveBeenCalledTimes(1);
  });
});
