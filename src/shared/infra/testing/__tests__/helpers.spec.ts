import { Sequelize } from 'sequelize-typescript';
import { setupSequelize } from '@/shared/infra/testing/helpers';

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
  });
});
