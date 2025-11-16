import { join } from 'path';
import { config as readEnv } from 'dotenv';

export class Config {
  static env: any = null;

  static db() {
    Config.readEnv();

    return {
      dialect: 'sqlite' as any,
      host: Config.env.DB_HOST,
      logging: Config.env.DB_LOGGING === 'true',
    };
  }

  static readEnv() {
    if (Config.env) {
      return;
    }
    const originalLog = console.log;
    console.log = () => {};
    Config.env = readEnv({
      path: join(__dirname, `../../../envs/.env.${process.env.NODE_ENV}`),
      debug: false,
    }).parsed;
    console.log = originalLog;
  }
}
