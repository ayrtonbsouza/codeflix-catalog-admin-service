import { ConfigModule, CONFIG_DB_SCHEMA } from '../config.module';
import * as Joi from 'joi';

function expectValidate(schema: Joi.Schema, value: Record<string, unknown>) {
  const result = schema.validate(value, { abortEarly: false });
  return expect(result.error?.message || '');
}

describe('Unit: [Schema]', () => {
  describe('[DB Schema]', () => {
    const schema = Joi.object({
      ...CONFIG_DB_SCHEMA,
    });

    describe('[DB_VENDOR]', () => {
      it('should return error when DB_VENDOR is missing', () => {
        // Arrange & Act & Assert
        expectValidate(schema, {}).toContain('"DB_VENDOR" is required');
      });

      it('should return error when DB_VENDOR is not a valid value', () => {
        // Arrange & Act & Assert
        expectValidate(schema, { DB_VENDOR: 5 }).toContain(
          '"DB_VENDOR" must be one of [sqlite, postgres]',
        );
      });

      it('should accept sqlite as valid DB_VENDOR', () => {
        // Arrange & Act & Assert
        expectValidate(schema, { DB_VENDOR: 'sqlite' }).not.toContain(
          'DB_VENDOR',
        );
      });

      it('should accept postgres as valid DB_VENDOR', () => {
        // Arrange & Act & Assert
        expectValidate(schema, { DB_VENDOR: 'postgres' }).not.toContain(
          'DB_VENDOR',
        );
      });
    });

    describe('[DB_HOST]', () => {
      it('should return error when DB_HOST is missing', () => {
        // Arrange & Act & Assert
        expectValidate(schema, {}).toContain('"DB_HOST" is required');
      });

      it('should return error when DB_HOST is not a string', () => {
        // Arrange & Act & Assert
        expectValidate(schema, { DB_HOST: 1 }).toContain(
          '"DB_HOST" must be a string',
        );
      });

      it('should return error when DB_HOST is empty string', () => {
        // Arrange & Act & Assert
        expectValidate(schema, { DB_HOST: '' }).toContain(
          '"DB_HOST" is not allowed to be empty',
        );
      });

      it('should accept valid DB_HOST values', () => {
        // Arrange
        const arrange = ['some value', 'localhost', '127.0.0.1'];

        // Act & Assert
        arrange.forEach((value) => {
          expectValidate(schema, { DB_HOST: value }).not.toContain('DB_HOST');
        });
      });
    });

    describe('[DB_DATABASE]', () => {
      it('should not require DB_DATABASE when DB_VENDOR is sqlite', () => {
        // Arrange & Act & Assert
        expectValidate(schema, { DB_VENDOR: 'sqlite' }).not.toContain(
          '"DB_DATABASE" is required',
        );
      });

      it('should require DB_DATABASE when DB_VENDOR is postgres', () => {
        // Arrange & Act & Assert
        expectValidate(schema, { DB_VENDOR: 'postgres' }).toContain(
          '"DB_DATABASE" is required',
        );
      });

      it('should return error when DB_DATABASE is not a string', () => {
        // Arrange & Act & Assert
        expectValidate(schema, { DB_DATABASE: 1 }).toContain(
          '"DB_DATABASE" must be a string',
        );
      });

      it('should return error when DB_DATABASE is empty string for postgres', () => {
        // Arrange & Act & Assert
        expectValidate(schema, {
          DB_VENDOR: 'postgres',
          DB_DATABASE: '',
        }).toContain('"DB_DATABASE" is not allowed to be empty');
      });

      it('should accept DB_DATABASE as optional for sqlite', () => {
        // Arrange
        const arrange = [
          { DB_VENDOR: 'sqlite' },
          { DB_VENDOR: 'sqlite', DB_DATABASE: 'some value' },
        ];

        // Act & Assert
        arrange.forEach((value) => {
          expectValidate(schema, value).not.toContain('DB_DATABASE');
        });
      });

      it('should accept DB_DATABASE as required for postgres', () => {
        // Arrange
        const arrange = [
          { DB_VENDOR: 'postgres', DB_DATABASE: 'some value' },
          { DB_VENDOR: 'postgres', DB_DATABASE: 'my_database' },
        ];

        // Act & Assert
        arrange.forEach((value) => {
          expectValidate(schema, value).not.toContain('DB_DATABASE');
        });
      });
    });

    describe('[DB_USERNAME]', () => {
      it('should not require DB_USERNAME when DB_VENDOR is sqlite', () => {
        // Arrange & Act & Assert
        expectValidate(schema, { DB_VENDOR: 'sqlite' }).not.toContain(
          '"DB_USERNAME" is required',
        );
      });

      it('should require DB_USERNAME when DB_VENDOR is postgres', () => {
        // Arrange & Act & Assert
        expectValidate(schema, { DB_VENDOR: 'postgres' }).toContain(
          '"DB_USERNAME" is required',
        );
      });

      it('should return error when DB_USERNAME is not a string', () => {
        // Arrange & Act & Assert
        expectValidate(schema, { DB_USERNAME: 1 }).toContain(
          '"DB_USERNAME" must be a string',
        );
      });

      it('should return error when DB_USERNAME is empty string for postgres', () => {
        // Arrange & Act & Assert
        expectValidate(schema, {
          DB_VENDOR: 'postgres',
          DB_USERNAME: '',
        }).toContain('"DB_USERNAME" is not allowed to be empty');
      });

      it('should accept DB_USERNAME as optional for sqlite', () => {
        // Arrange
        const arrange = [
          { DB_VENDOR: 'sqlite' },
          { DB_VENDOR: 'sqlite', DB_USERNAME: 'some value' },
        ];

        // Act & Assert
        arrange.forEach((value) => {
          expectValidate(schema, value).not.toContain('DB_USERNAME');
        });
      });

      it('should accept DB_USERNAME as required for postgres', () => {
        // Arrange
        const arrange = [
          { DB_VENDOR: 'postgres', DB_USERNAME: 'some value' },
          { DB_VENDOR: 'postgres', DB_USERNAME: 'admin' },
        ];

        // Act & Assert
        arrange.forEach((value) => {
          expectValidate(schema, value).not.toContain('DB_USERNAME');
        });
      });
    });

    describe('[DB_PASSWORD]', () => {
      it('should not require DB_PASSWORD when DB_VENDOR is sqlite', () => {
        // Arrange & Act & Assert
        expectValidate(schema, { DB_VENDOR: 'sqlite' }).not.toContain(
          '"DB_PASSWORD" is required',
        );
      });

      it('should require DB_PASSWORD when DB_VENDOR is postgres', () => {
        // Arrange & Act & Assert
        expectValidate(schema, { DB_VENDOR: 'postgres' }).toContain(
          '"DB_PASSWORD" is required',
        );
      });

      it('should return error when DB_PASSWORD is not a string', () => {
        // Arrange & Act & Assert
        expectValidate(schema, { DB_PASSWORD: 1 }).toContain(
          '"DB_PASSWORD" must be a string',
        );
      });

      it('should return error when DB_PASSWORD is empty string for postgres', () => {
        // Arrange & Act & Assert
        expectValidate(schema, {
          DB_VENDOR: 'postgres',
          DB_PASSWORD: '',
        }).toContain('"DB_PASSWORD" is not allowed to be empty');
      });

      it('should accept DB_PASSWORD as optional for sqlite', () => {
        // Arrange
        const arrange = [
          { DB_VENDOR: 'sqlite' },
          { DB_VENDOR: 'sqlite', DB_PASSWORD: 'some value' },
        ];

        // Act & Assert
        arrange.forEach((value) => {
          expectValidate(schema, value).not.toContain('DB_PASSWORD');
        });
      });

      it('should accept DB_PASSWORD as required for postgres', () => {
        // Arrange
        const arrange = [
          { DB_VENDOR: 'postgres', DB_PASSWORD: 'some value' },
          { DB_VENDOR: 'postgres', DB_PASSWORD: 'secret123' },
        ];

        // Act & Assert
        arrange.forEach((value) => {
          expectValidate(schema, value).not.toContain('DB_PASSWORD');
        });
      });
    });

    describe('[DB_PORT]', () => {
      it('should not require DB_PORT when DB_VENDOR is sqlite', () => {
        // Arrange & Act & Assert
        expectValidate(schema, { DB_VENDOR: 'sqlite' }).not.toContain(
          '"DB_PORT" is required',
        );
      });

      it('should require DB_PORT when DB_VENDOR is postgres', () => {
        // Arrange & Act & Assert
        expectValidate(schema, { DB_VENDOR: 'postgres' }).toContain(
          '"DB_PORT" is required',
        );
      });

      it('should return error when DB_PORT is not a number', () => {
        // Arrange & Act & Assert
        expectValidate(schema, { DB_PORT: 'a' }).toContain(
          '"DB_PORT" must be a number',
        );
      });

      it('should return error when DB_PORT is not an integer', () => {
        // Arrange & Act & Assert
        expectValidate(schema, { DB_PORT: '1.2' }).toContain(
          '"DB_PORT" must be an integer',
        );
      });

      it('should accept DB_PORT as integer even if negative (schema allows it)', () => {
        // Arrange & Act
        const result = schema.validate(
          {
            DB_VENDOR: 'postgres',
            DB_HOST: 'localhost',
            DB_PORT: -1,
            DB_DATABASE: 'test',
            DB_USERNAME: 'user',
            DB_PASSWORD: 'pass',
            DB_LOGGING: false,
            DB_AUTO_LOAD_MODELS: true,
          },
          { abortEarly: false },
        );

        // Assert
        expect(result.error).toBeUndefined();
        expect(result.value.DB_PORT).toBe(-1);
      });

      it('should accept DB_PORT as optional for sqlite', () => {
        // Arrange
        const arrange = [
          { DB_VENDOR: 'sqlite' },
          { DB_VENDOR: 'sqlite', DB_PORT: 10 },
          { DB_VENDOR: 'sqlite', DB_PORT: '10' },
          { DB_VENDOR: 'sqlite', DB_PORT: 0 },
        ];

        // Act & Assert
        arrange.forEach((value) => {
          expectValidate(schema, value).not.toContain('DB_PORT');
        });
      });

      it('should accept DB_PORT as required for postgres', () => {
        // Arrange
        const arrange = [
          { DB_VENDOR: 'postgres', DB_PORT: 10 },
          { DB_VENDOR: 'postgres', DB_PORT: '10' },
          { DB_VENDOR: 'postgres', DB_PORT: 5432 },
          { DB_VENDOR: 'postgres', DB_PORT: 0 },
        ];

        // Act & Assert
        arrange.forEach((value) => {
          expectValidate(schema, value).not.toContain('DB_PORT');
        });
      });
    });

    describe('[DB_LOGGING]', () => {
      it('should return error when DB_LOGGING is missing', () => {
        // Arrange & Act & Assert
        expectValidate(schema, {}).toContain('"DB_LOGGING" is required');
      });

      it('should return error when DB_LOGGING is not a boolean', () => {
        // Arrange & Act & Assert
        expectValidate(schema, { DB_LOGGING: 'a' }).toContain(
          '"DB_LOGGING" must be a boolean',
        );
      });

      it('should accept valid DB_LOGGING values', () => {
        // Arrange
        const arrange = [true, false, 'true', 'false'];

        // Act & Assert
        arrange.forEach((value) => {
          expectValidate(schema, { DB_LOGGING: value }).not.toContain(
            'DB_LOGGING',
          );
        });
      });
    });

    describe('[DB_AUTO_LOAD_MODELS]', () => {
      it('should return error when DB_AUTO_LOAD_MODELS is missing', () => {
        // Arrange & Act & Assert
        expectValidate(schema, {}).toContain(
          '"DB_AUTO_LOAD_MODELS" is required',
        );
      });

      it('should return error when DB_AUTO_LOAD_MODELS is not a boolean', () => {
        // Arrange & Act & Assert
        expectValidate(schema, { DB_AUTO_LOAD_MODELS: 'a' }).toContain(
          '"DB_AUTO_LOAD_MODELS" must be a boolean',
        );
      });

      it('should accept valid DB_AUTO_LOAD_MODELS values', () => {
        // Arrange
        const arrange = [true, false, 'true', 'false'];

        // Act & Assert
        arrange.forEach((value) => {
          expectValidate(schema, { DB_AUTO_LOAD_MODELS: value }).not.toContain(
            'DB_AUTO_LOAD_MODELS',
          );
        });
      });
    });
  });
});

describe('Unit: [ConfigModule]', () => {
  describe('[forRoot]', () => {
    it('should validate schema correctly', () => {
      // Arrange & Act & Assert
      expect(CONFIG_DB_SCHEMA).toBeDefined();
      expect(CONFIG_DB_SCHEMA.DB_VENDOR).toBeDefined();
      expect(CONFIG_DB_SCHEMA.DB_HOST).toBeDefined();
      expect(CONFIG_DB_SCHEMA.DB_LOGGING).toBeDefined();
      expect(CONFIG_DB_SCHEMA.DB_AUTO_LOAD_MODELS).toBeDefined();
    });

    it('should handle envFilePath as a string', () => {
      // Arrange
      const envFilePath = '/path/to/.env';

      // Act
      const result = ConfigModule.forRoot({ envFilePath });

      // Assert
      expect(result).toBeDefined();
    });

    it('should handle envFilePath as an array', () => {
      // Arrange
      const envFilePath = ['/path/to/.env', '/path/to/.env.local'];

      // Act
      const result = ConfigModule.forRoot({ envFilePath });

      // Assert
      expect(result).toBeDefined();
    });

    it('should handle envFilePath as undefined', () => {
      // Arrange & Act
      const result = ConfigModule.forRoot();

      // Assert
      expect(result).toBeDefined();
    });

    it('should merge otherOptions with default options', () => {
      // Arrange
      const otherOptions = {
        cache: true,
        expandVariables: true,
      };

      // Act
      const result = ConfigModule.forRoot(otherOptions);

      // Assert
      expect(result).toBeDefined();
    });
  });
});
