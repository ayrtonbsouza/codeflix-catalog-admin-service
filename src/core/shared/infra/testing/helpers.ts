import { Sequelize, type SequelizeOptions } from 'sequelize-typescript';
import { Config } from '@core/shared/infra/config';

function getLoggingOption(
  enableLogging: boolean,
): false | ((sql: string) => void) {
  return enableLogging ? console.log : false;
}

export function setupSequelize(options: SequelizeOptions = {}) {
  let _sequelize: Sequelize | undefined;

  beforeAll(() => {
    const dbConfig = Config.db();
    const logging =
      options.logging !== undefined
        ? typeof options.logging === 'boolean'
          ? getLoggingOption(options.logging)
          : options.logging
        : typeof dbConfig.logging === 'boolean'
          ? getLoggingOption(dbConfig.logging)
          : dbConfig.logging;

    _sequelize = new Sequelize({
      ...dbConfig,
      ...options,
      logging,
    });
  });

  beforeEach(async () => {
    if (_sequelize) {
      await _sequelize.sync({ force: true });
    }
  });

  afterAll(async () => {
    if (_sequelize) {
      await _sequelize.close();
    }
  });

  return {
    get sequelize() {
      return _sequelize;
    },
  };
}
