import { Sequelize, type SequelizeOptions } from 'sequelize-typescript';
import { Config } from '@/shared/infra/config';

export function setupSequelize(options: SequelizeOptions = {}) {
  let _sequelize: Sequelize | undefined;

  beforeAll(() => {
    _sequelize = new Sequelize({
      ...Config.db(),
      ...options,
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
