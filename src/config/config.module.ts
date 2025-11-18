import { Module } from '@nestjs/common';
import Joi from 'joi';
import {
  ConfigModule as NestConfigModule,
  type ConfigModuleOptions,
} from '@nestjs/config';
import { join } from 'path';

type DB_SCHEMA_TYPE = {
  DB_VENDOR: 'sqlite' | 'postgres';
  DB_HOST: string;
  DB_PORT: number;
  DB_DATABASE: string;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_LOGGING: boolean;
  DB_AUTO_LOAD_MODELS: boolean;
};

export const CONFIG_DB_SCHEMA: Joi.StrictSchemaMap<DB_SCHEMA_TYPE> = {
  DB_VENDOR: Joi.string().required().valid('sqlite', 'postgres'),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().integer().when('DB_VENDOR', {
    is: 'postgres',
    then: Joi.number().integer().required(),
    otherwise: Joi.number().integer().optional(),
  }),
  DB_DATABASE: Joi.string().when('DB_VENDOR', {
    is: 'postgres',
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
  DB_USERNAME: Joi.string().when('DB_VENDOR', {
    is: 'postgres',
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
  DB_PASSWORD: Joi.string().when('DB_VENDOR', {
    is: 'postgres',
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
  DB_LOGGING: Joi.boolean().required(),
  DB_AUTO_LOAD_MODELS: Joi.boolean().required(),
};

export type CONFIG_SCHEMA_TYPE = DB_SCHEMA_TYPE;

@Module({})
export class ConfigModule extends NestConfigModule {
  static forRoot(options: ConfigModuleOptions = {}) {
    const { envFilePath, ...otherOptions } = options;
    return super.forRoot({
      isGlobal: true,
      envFilePath: [
        ...(Array.isArray(envFilePath) ? envFilePath : [envFilePath]),
        join(process.cwd(), 'envs', `.env.${process.env.NODE_ENV}`),
        join(process.cwd(), 'envs', '.env'),
      ],
      validationSchema: Joi.object({ ...CONFIG_DB_SCHEMA }),
      ...otherOptions,
    });
  }
}
