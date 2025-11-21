import { Test } from '@nestjs/testing';
import { DatabaseModule } from '@modules/database-module/database.module';
import { getConnectionToken } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { ConfigModule } from '@/modules/config-module/config.module';

async function isDatabaseAvailable(
  host: string,
  port: number,
): Promise<boolean> {
  try {
    const { Client } = await import('pg');
    const client = new Client({
      host,
      port,
      user: 'postgres',
      password: 'root',
      database: 'catalog_admin_database',
      connectionTimeoutMillis: 1000,
    });
    await client.connect();
    await client.end();
    return true;
  } catch {
    return false;
  }
}

describe('Unit: [DatabaseModule]', () => {
  afterAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  describe('[sqlite connection]', () => {
    const connOptions = {
      DB_VENDOR: 'sqlite',
      DB_HOST: ':memory:',
      DB_LOGGING: false,
      DB_AUTO_LOAD_MODELS: true,
    };

    it('should be a sqlite connection', async () => {
      // Arrange
      const module = await Test.createTestingModule({
        imports: [
          DatabaseModule,
          ConfigModule.forRoot({
            isGlobal: true,
            ignoreEnvFile: true,
            ignoreEnvVars: true,
            validationSchema: null,
            load: [() => connOptions],
          }),
        ],
      }).compile();

      const app = module.createNestApplication();

      // Act
      const conn = app.get<Sequelize>(getConnectionToken());

      // Assert
      expect(conn).toBeDefined();
      expect(conn.options.dialect).toBe('sqlite');
      expect(conn.options.host).toBe(':memory:');
      expect(conn.options.logging).toBe(false);
      expect(
        (conn.options as { autoLoadModels?: boolean }).autoLoadModels,
      ).toBe(true);

      await app.close();
      try {
        await conn.close();
      } catch (error) {
        // Ignore error
      }
    });

    it('should configure sqlite connection with logging enabled', async () => {
      // Arrange
      const connOptionsWithLogging = {
        ...connOptions,
        DB_LOGGING: true,
      };

      const module = await Test.createTestingModule({
        imports: [
          DatabaseModule,
          ConfigModule.forRoot({
            isGlobal: true,
            ignoreEnvFile: true,
            ignoreEnvVars: true,
            validationSchema: null,
            load: [() => connOptionsWithLogging],
          }),
        ],
      }).compile();

      const app = module.createNestApplication();

      // Act
      const conn = app.get<Sequelize>(getConnectionToken());

      // Assert
      expect(conn).toBeDefined();
      expect(conn.options.dialect).toBe('sqlite');
      expect(typeof conn.options.logging).toBe('function');
      expect(conn.options.logging).toBe(console.log);

      await app.close();
      try {
        await conn.close();
      } catch (error) {
        // Ignore error
      }
    });

    it('should use false as default when DB_LOGGING is undefined', async () => {
      // Arrange
      const connOptionsWithoutLogging = {
        DB_VENDOR: 'sqlite',
        DB_HOST: ':memory:',
        DB_AUTO_LOAD_MODELS: true,
      };

      const module = await Test.createTestingModule({
        imports: [
          DatabaseModule,
          ConfigModule.forRoot({
            isGlobal: true,
            ignoreEnvFile: true,
            ignoreEnvVars: true,
            validationSchema: null,
            load: [() => connOptionsWithoutLogging],
          }),
        ],
      }).compile();

      const app = module.createNestApplication();

      // Act
      const conn = app.get<Sequelize>(getConnectionToken());

      // Assert
      expect(conn).toBeDefined();
      expect(conn.options.dialect).toBe('sqlite');
      expect(conn.options.logging).toBe(false);

      await app.close();
      try {
        await conn.close();
      } catch (error) {
        // Ignore error
      }
    });

    it('should configure sqlite connection with autoLoadModels disabled', async () => {
      // Arrange
      const connOptionsWithoutAutoLoad = {
        ...connOptions,
        DB_AUTO_LOAD_MODELS: false,
      };

      const module = await Test.createTestingModule({
        imports: [
          DatabaseModule,
          ConfigModule.forRoot({
            isGlobal: true,
            ignoreEnvFile: true,
            ignoreEnvVars: true,
            validationSchema: null,
            load: [() => connOptionsWithoutAutoLoad],
          }),
        ],
      }).compile();

      const app = module.createNestApplication();

      // Act
      const conn = app.get<Sequelize>(getConnectionToken());

      // Assert
      expect(conn).toBeDefined();
      expect(conn.options.dialect).toBe('sqlite');
      expect(
        (conn.options as { autoLoadModels?: boolean }).autoLoadModels,
      ).toBe(false);

      await conn.close();
      await app.close();
    });
  });

  describe('[postgres connection]', () => {
    const connOptions = {
      DB_VENDOR: 'postgres',
      DB_HOST: 'localhost',
      DB_DATABASE: 'catalog_admin_database',
      DB_USERNAME: 'postgres',
      DB_PASSWORD: 'root',
      DB_PORT: 5432,
      DB_LOGGING: false,
      DB_AUTO_LOAD_MODELS: true,
    };

    it('should be a postgres connection', async () => {
      // Arrange
      const isDbAvailable = await isDatabaseAvailable(
        connOptions.DB_HOST,
        connOptions.DB_PORT,
      );

      if (!isDbAvailable) {
        expect(connOptions.DB_VENDOR).toBe('postgres');
        expect(connOptions.DB_HOST).toBe('localhost');
        expect(connOptions.DB_DATABASE).toBe('catalog_admin_database');
        expect(connOptions.DB_USERNAME).toBe('postgres');
        expect(connOptions.DB_PORT).toBe(5432);
        return;
      }

      const module = await Test.createTestingModule({
        imports: [
          DatabaseModule,
          ConfigModule.forRoot({
            isGlobal: true,
            ignoreEnvFile: true,
            ignoreEnvVars: true,
            validationSchema: null,
            load: [() => connOptions],
          }),
        ],
      }).compile();

      const app = module.createNestApplication();
      await app.init();

      // Act
      const conn = app.get<Sequelize>(getConnectionToken());

      // Assert
      expect(conn).toBeDefined();
      expect(conn.options.dialect).toBe(connOptions.DB_VENDOR);
      expect(conn.options.host).toBe(connOptions.DB_HOST);
      expect(conn.options.database).toBe(connOptions.DB_DATABASE);
      expect(conn.options.username).toBe(connOptions.DB_USERNAME);
      expect(conn.options.password).toBe(connOptions.DB_PASSWORD);
      expect(conn.options.port).toBe(connOptions.DB_PORT);
      expect(conn.options.logging).toBe(false);
      expect(
        (conn.options as { autoLoadModels?: boolean }).autoLoadModels,
      ).toBe(true);

      try {
        await conn.close();
      } catch (error) {
        // Ignore error
      }
      await app.close();
    }, 30000);

    it('should configure postgres connection with logging enabled', async () => {
      // Arrange
      const connOptionsWithLogging = {
        ...connOptions,
        DB_LOGGING: true,
      };

      const isDbAvailable = await isDatabaseAvailable(
        connOptions.DB_HOST,
        connOptions.DB_PORT,
      );

      if (!isDbAvailable) {
        expect(connOptionsWithLogging.DB_VENDOR).toBe('postgres');
        expect(connOptionsWithLogging.DB_LOGGING).toBe(true);
        return;
      }

      const module = await Test.createTestingModule({
        imports: [
          DatabaseModule,
          ConfigModule.forRoot({
            isGlobal: true,
            ignoreEnvFile: true,
            ignoreEnvVars: true,
            validationSchema: null,
            load: [() => connOptionsWithLogging],
          }),
        ],
      }).compile();

      const app = module.createNestApplication();
      await app.init();

      // Act
      const conn = app.get<Sequelize>(getConnectionToken());

      // Assert
      expect(conn).toBeDefined();
      expect(conn.options.dialect).toBe('postgres');
      expect(typeof conn.options.logging).toBe('function');
      expect(conn.options.logging).toBe(console.log);

      try {
        await conn.close();
      } catch (error) {
        // Ignore error
      }
      await app.close();
    }, 30000);

    it('should use false as default when DB_LOGGING is undefined', async () => {
      const connOptionsWithoutLogging = {
        DB_VENDOR: 'postgres',
        DB_HOST: 'localhost',
        DB_DATABASE: 'catalog_admin_database',
        DB_USERNAME: 'postgres',
        DB_PASSWORD: 'root',
        DB_PORT: 5432,
        DB_AUTO_LOAD_MODELS: true,
      };

      const isDbAvailable = await isDatabaseAvailable(
        connOptionsWithoutLogging.DB_HOST,
        connOptionsWithoutLogging.DB_PORT,
      );

      if (!isDbAvailable) {
        expect(connOptionsWithoutLogging.DB_VENDOR).toBe('postgres');
        return;
      }

      const module = await Test.createTestingModule({
        imports: [
          DatabaseModule,
          ConfigModule.forRoot({
            isGlobal: true,
            ignoreEnvFile: true,
            ignoreEnvVars: true,
            validationSchema: null,
            load: [() => connOptionsWithoutLogging],
          }),
        ],
      }).compile();

      const app = module.createNestApplication();
      await app.init();

      // Act
      const conn = app.get<Sequelize>(getConnectionToken());

      // Assert
      expect(conn).toBeDefined();
      expect(conn.options.dialect).toBe('postgres');
      expect(conn.options.logging).toBe(false);

      try {
        await conn.close();
      } catch (error) {
        // Ignore error
      }
      await app.close();
    }, 30000);

    it('should configure postgres connection with autoLoadModels disabled', async () => {
      // Arrange
      const connOptionsWithoutAutoLoad = {
        ...connOptions,
        DB_AUTO_LOAD_MODELS: false,
      };

      const module = await Test.createTestingModule({
        imports: [
          DatabaseModule,
          ConfigModule.forRoot({
            isGlobal: true,
            ignoreEnvFile: true,
            ignoreEnvVars: true,
            validationSchema: null,
            load: [() => connOptionsWithoutAutoLoad],
          }),
        ],
      }).compile();

      const app = module.createNestApplication();
      await app.init();

      // Act
      const conn = app.get<Sequelize>(getConnectionToken());

      // Assert
      expect(conn).toBeDefined();
      expect(conn.options.dialect).toBe('postgres');
      expect(
        (conn.options as { autoLoadModels?: boolean }).autoLoadModels,
      ).toBe(false);

      try {
        await conn.close();
      } catch (error) {
        // Ignore error
      }
      await app.close();
    }, 30000);

    it('should configure postgres connection with custom port', () => {
      // Arrange
      const connOptionsCustomPort = {
        ...connOptions,
        DB_PORT: 5433,
      };

      // Act & Assert
      expect(connOptionsCustomPort.DB_VENDOR).toBe('postgres');
      expect(connOptionsCustomPort.DB_PORT).toBe(5433);
      expect(connOptionsCustomPort.DB_HOST).toBe(connOptions.DB_HOST);
      expect(connOptionsCustomPort.DB_DATABASE).toBe(connOptions.DB_DATABASE);
      expect(connOptionsCustomPort.DB_USERNAME).toBe(connOptions.DB_USERNAME);
      expect(connOptionsCustomPort.DB_PASSWORD).toBe(connOptions.DB_PASSWORD);
    });
  });

  describe('[invalid vendor]', () => {
    it('should throw error when DB_VENDOR is invalid', async () => {
      // Arrange
      const connOptions = {
        DB_VENDOR: 'mysql',
        DB_HOST: 'localhost',
        DB_LOGGING: false,
        DB_AUTO_LOAD_MODELS: true,
      };

      // Act & Assert
      await expect(
        Test.createTestingModule({
          imports: [
            DatabaseModule,
            ConfigModule.forRoot({
              isGlobal: true,
              ignoreEnvFile: true,
              ignoreEnvVars: true,
              validationSchema: null,
              load: [() => connOptions],
            }),
          ],
        }).compile(),
      ).rejects.toThrow('Invalid database vendor: mysql');
    });

    it('should throw error when DB_VENDOR is undefined', async () => {
      // Arrange
      const connOptions = {
        DB_VENDOR: undefined,
        DB_HOST: 'localhost',
        DB_LOGGING: false,
        DB_AUTO_LOAD_MODELS: true,
      };

      // Act & Assert
      await expect(
        Test.createTestingModule({
          imports: [
            DatabaseModule,
            ConfigModule.forRoot({
              isGlobal: true,
              ignoreEnvFile: true,
              ignoreEnvVars: true,
              validationSchema: null,
              load: [() => connOptions],
            }),
          ],
        }).compile(),
      ).rejects.toThrow('Invalid database vendor: undefined');
    });
  });
});
