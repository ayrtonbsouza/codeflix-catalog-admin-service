import { Config } from '@core/shared/infra/config';
import { config as readEnv } from 'dotenv';

jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

describe('Unit: [Config]', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalConsoleLog = console.log;

  beforeEach(() => {
    (Config as { env: typeof Config.env }).env = null;
    jest.clearAllMocks();
    console.log = originalConsoleLog;
  });

  afterAll(() => {
    process.env.NODE_ENV = originalEnv;
    console.log = originalConsoleLog;
  });

  describe('[readEnv]', () => {
    it('should load environment variables from .env file', () => {
      // Arrange
      const mockParsed = {
        DB_HOST: 'test-host',
        DB_LOGGING: 'true',
      };
      (readEnv as jest.Mock).mockReturnValue({ parsed: mockParsed });
      process.env.NODE_ENV = 'test';

      // Act
      Config.readEnv();

      // Assert
      expect(readEnv).toHaveBeenCalledTimes(1);
      expect(Config.env).toEqual(mockParsed);
    });

    it('should not reload environment variables if already loaded', () => {
      // Arrange
      const mockParsed = {
        DB_HOST: 'test-host',
        DB_LOGGING: 'true',
      };
      (readEnv as jest.Mock).mockReturnValue({ parsed: mockParsed });
      process.env.NODE_ENV = 'test';
      Config.readEnv();
      jest.clearAllMocks();

      // Act
      Config.readEnv();

      // Assert
      expect(readEnv).not.toHaveBeenCalled();
      expect(Config.env).toEqual(mockParsed);
    });

    it('should suppress console.log during environment loading', () => {
      // Arrange
      const mockParsed = {
        DB_HOST: 'test-host',
        DB_LOGGING: 'true',
      };
      (readEnv as jest.Mock).mockReturnValue({ parsed: mockParsed });
      process.env.NODE_ENV = 'test';
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      Config.readEnv();

      // Assert
      expect(consoleLogSpy).not.toHaveBeenCalled();
      consoleLogSpy.mockRestore();
    });

    it('should restore console.log after environment loading', () => {
      // Arrange
      const mockParsed = {
        DB_HOST: 'test-host',
        DB_LOGGING: 'true',
      };
      (readEnv as jest.Mock).mockReturnValue({ parsed: mockParsed });
      process.env.NODE_ENV = 'test';
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      Config.readEnv();
      console.log('test message');

      // Assert
      expect(consoleLogSpy).toHaveBeenCalledWith('test message');
      consoleLogSpy.mockRestore();
    });

    it('should use correct path based on NODE_ENV', () => {
      // Arrange
      const mockParsed = {
        DB_HOST: 'test-host',
        DB_LOGGING: 'true',
      };
      (readEnv as jest.Mock).mockReturnValue({ parsed: mockParsed });
      process.env.NODE_ENV = 'development';

      // Act
      Config.readEnv();

      // Assert
      expect(readEnv).toHaveBeenCalledWith(
        expect.objectContaining({
          debug: false,
        }),
      );
      const callPath = (readEnv as jest.Mock).mock.calls[0][0].path;
      expect(callPath).toContain('.env.development');
    });
  });

  describe('[db]', () => {
    it('should return database configuration with sqlite dialect', () => {
      // Arrange
      const mockParsed = {
        DB_HOST: 'test-host',
        DB_LOGGING: 'true',
      };
      (readEnv as jest.Mock).mockReturnValue({ parsed: mockParsed });
      process.env.NODE_ENV = 'test';
      Config.readEnv();

      // Act
      const dbConfig = Config.db();

      // Assert
      expect(dbConfig.dialect).toBe('sqlite');
      expect(dbConfig.host).toBe('test-host');
      // Quando DB_LOGGING é 'true', logging deve ser uma função (console.log)
      expect(typeof dbConfig.logging).toBe('function');
      expect(dbConfig.logging).toBe(console.log);
    });

    it('should return logging as false when DB_LOGGING is not "true"', () => {
      // Arrange
      const mockParsed = {
        DB_HOST: 'test-host',
        DB_LOGGING: 'false',
      };
      (readEnv as jest.Mock).mockReturnValue({ parsed: mockParsed });
      process.env.NODE_ENV = 'test';
      Config.readEnv();

      // Act
      const dbConfig = Config.db();

      // Assert
      expect(dbConfig.logging).toBe(false);
    });

    it('should return logging as false when DB_LOGGING is undefined', () => {
      // Arrange
      const mockParsed = {
        DB_HOST: 'test-host',
      };
      (readEnv as jest.Mock).mockReturnValue({ parsed: mockParsed });
      process.env.NODE_ENV = 'test';
      Config.readEnv();

      // Act
      const dbConfig = Config.db();

      // Assert
      expect(dbConfig.logging).toBe(false);
    });

    it('should call readEnv when db() is called', () => {
      // Arrange
      const mockParsed = {
        DB_HOST: 'test-host',
        DB_LOGGING: 'true',
      };
      (readEnv as jest.Mock).mockReturnValue({ parsed: mockParsed });
      process.env.NODE_ENV = 'test';
      (Config as { env: typeof Config.env }).env = null;

      // Act
      Config.db();

      // Assert
      expect(readEnv).toHaveBeenCalled();
    });
  });
});
