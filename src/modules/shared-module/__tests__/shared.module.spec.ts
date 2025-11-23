import { Test, TestingModule } from '@nestjs/testing';
import { SharedModule } from '@modules/shared-module/shared.module';

describe('Unit: [SharedModule]', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [SharedModule],
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
    const sharedModule = module.get(SharedModule);

    // Assert
    expect(sharedModule).toBeDefined();
    expect(sharedModule).toBeInstanceOf(SharedModule);
  });

  it('should compile without errors', () => {
    // Assert
    expect(module).toBeDefined();
  });
});
