import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@/app.module';

describe('Unit: [AppModule]', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    // Assert
    expect(module).toBeDefined();
  });

  it('should be a valid NestJS module', () => {
    // Act
    const appModule = module.get(AppModule);

    // Assert
    expect(appModule).toBeDefined();
    expect(appModule).toBeInstanceOf(AppModule);
  });

  it('should compile without errors', () => {
    // Assert
    expect(module).toBeDefined();
  });
});

