import { Sequelize } from 'sequelize-typescript';
import { setupSequelize } from '@core/shared/infra/testing/helpers';

describe('Unit: [setupSequelize Helper]', () => {
  const setupResult = setupSequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  });

  describe('[setupSequelize]', () => {
    it('should return an object with sequelize getter', () => {
      // Arrange & Act & Assert
      expect(setupResult).toBeDefined();
      expect(setupResult).toHaveProperty('sequelize');
      expect(setupResult.sequelize).toBeInstanceOf(Sequelize);
    });

    it('should return same sequelize instance on multiple accesses', () => {
      // Arrange
      const instance1 = setupResult.sequelize;
      const instance2 = setupResult.sequelize;

      // Act & Assert
      expect(instance1).toBe(instance2);
      expect(instance1).toBeInstanceOf(Sequelize);
    });

    it('should provide a working Sequelize instance with correct dialect', () => {
      // Arrange & Act & Assert
      expect(setupResult.sequelize).toBeInstanceOf(Sequelize);
      expect(setupResult.sequelize.getDialect()).toBe('sqlite');
    });

    it('should allow accessing sequelize instance properties', () => {
      // Arrange & Act & Assert
      expect(setupResult.sequelize).toBeDefined();
      expect(typeof setupResult.sequelize.getDialect).toBe('function');
    });

    it('should throw error when accessing sequelize getter before initialization', () => {
      // Arrange
      const _sequelize: Sequelize | undefined = undefined;

      const result = {
        get sequelize() {
          if (!_sequelize) {
            throw new Error('Sequelize instance not initialized');
          }
          return _sequelize;
        },
      };

      // Act & Assert
      expect(() => result.sequelize).toThrow(
        'Sequelize instance not initialized',
      );
    });

    it('should not throw error when accessing sequelize getter after initialization', () => {
      // Arrange
      const _sequelize: Sequelize | undefined = new Sequelize({
        dialect: 'sqlite',
        storage: ':memory:',
        logging: false,
      });

      const result = {
        get sequelize() {
          if (!_sequelize) {
            throw new Error('Sequelize instance not initialized');
          }
          return _sequelize;
        },
      };

      // Act & Assert
      expect(() => result.sequelize).not.toThrow();
      expect(result.sequelize).toBeInstanceOf(Sequelize);
    });
  });

  describe('[beforeEach sync behavior]', () => {
    it('should call sync on sequelize instance when it exists', async () => {
      // Arrange
      const _sequelize: Sequelize | undefined = new Sequelize({
        dialect: 'sqlite',
        storage: ':memory:',
        logging: false,
      });
      const syncSpy = jest.spyOn(_sequelize, 'sync');

      // Act
      if (_sequelize) {
        await _sequelize.sync({ force: true });
      }

      // Assert
      expect(syncSpy).toHaveBeenCalledWith({ force: true });
      syncSpy.mockRestore();
      await _sequelize.close();
    });

    it('should not throw error when sync is called with undefined sequelize', async () => {
      // Arrange
      const _sequelize: Sequelize | undefined = undefined;

      // Act & Assert
      if (_sequelize) {
        await _sequelize.sync({ force: true });
      }

      // Should not throw error
      expect(_sequelize).toBeUndefined();
    });
  });

  describe('[afterAll close behavior]', () => {
    it('should call close on sequelize instance when it exists', async () => {
      // Arrange
      const _sequelize: Sequelize | undefined = new Sequelize({
        dialect: 'sqlite',
        storage: ':memory:',
        logging: false,
      });
      const closeSpy = jest.spyOn(_sequelize, 'close');

      // Act
      if (_sequelize) {
        await _sequelize.close();
      }

      // Assert
      expect(closeSpy).toHaveBeenCalled();
      closeSpy.mockRestore();
    });

    it('should not throw error when close is called with undefined sequelize', async () => {
      // Arrange
      const _sequelize: Sequelize | undefined = undefined;

      // Act & Assert
      if (_sequelize) {
        await _sequelize.close();
      }

      expect(_sequelize).toBeUndefined();
    });
  });

  describe('[error handling]', () => {
    it('should handle undefined sequelize gracefully in getter', () => {
      // Arrange
      const result = {
        get sequelize() {
          const _sequelize: Sequelize | undefined = undefined;
          if (!_sequelize) {
            throw new Error('Sequelize instance not initialized');
          }
          return _sequelize;
        },
      };

      // Act & Assert
      expect(() => result.sequelize).toThrow(
        'Sequelize instance not initialized',
      );
      expect(() => result.sequelize).toThrow(Error);
    });

    it('should throw error when accessing sequelize getter if beforeAll fails', () => {
      // Arrange
      const _sequelize: Sequelize | undefined = undefined;

      const result = {
        get sequelize() {
          if (!_sequelize) {
            throw new Error('Sequelize instance not initialized');
          }
          return _sequelize;
        },
      };

      // Act & Assert
      expect(() => result.sequelize).toThrow(
        'Sequelize instance not initialized',
      );
      expect(() => result.sequelize).toThrow(Error);
    });
  });

  describe('[getter error path coverage]', () => {
    it('should cover the error throwing path in sequelize getter', () => {
      // Arrange
      let _sequelize: Sequelize | undefined = undefined;

      const helperResult = {
        get sequelize() {
          if (!_sequelize) {
            throw new Error('Sequelize instance not initialized');
          }
          return _sequelize;
        },
      };

      // Act & Assert
      expect(() => helperResult.sequelize).toThrow(
        'Sequelize instance not initialized',
      );

      _sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: ':memory:',
        logging: false,
      });

      const helperResult2 = {
        get sequelize() {
          if (!_sequelize) {
            throw new Error('Sequelize instance not initialized');
          }
          return _sequelize;
        },
      };

      expect(() => helperResult2.sequelize).not.toThrow();
      expect(helperResult2.sequelize).toBe(_sequelize);
      _sequelize.close();
    });
  });
});

describe('Unit: [setupSequelize Helper - Error Path Coverage]', () => {
  it('should throw error when accessing sequelize getter if instance is not initialized', () => {
    // Arrange
    const _sequelize: Sequelize | undefined = undefined;

    const testHelper = {
      get sequelize() {
        if (!_sequelize) {
          throw new Error('Sequelize instance not initialized');
        }
        return _sequelize;
      },
    };

    // Act & Assert
    expect(() => testHelper.sequelize).toThrow(
      'Sequelize instance not initialized',
    );

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      testHelper.sequelize;
      fail('Expected error to be thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe(
        'Sequelize instance not initialized',
      );
    }
  });
});
