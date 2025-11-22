import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CategoryModel } from '@core/category/infra/db/sequelize/model/category.model';
import { ConfigService } from '@nestjs/config';
import type { CONFIG_SCHEMA_TYPE } from '@modules/config-module/config.module';

const models = [CategoryModel];

function getLoggingOption(
  enableLogging: boolean,
): false | ((sql: string) => void) {
  return enableLogging ? console.log : false;
}

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      useFactory: (configService: ConfigService<CONFIG_SCHEMA_TYPE>) => {
        const dbVendor = configService.get('DB_VENDOR');
        const logging = getLoggingOption(
          configService.get('DB_LOGGING') ?? false,
        );

        if (configService.get('DB_VENDOR') === 'sqlite') {
          return {
            dialect: 'sqlite',
            host: configService.get('DB_HOST'),
            logging,
            models,
            autoLoadModels: configService.get('DB_AUTO_LOAD_MODELS'),
          };
        }
        if (configService.get('DB_VENDOR') === 'postgres') {
          return {
            dialect: 'postgres',
            host: configService.get('DB_HOST'),
            port: configService.get('DB_PORT'),
            database: configService.get('DB_DATABASE'),
            username: configService.get('DB_USERNAME'),
            password: configService.get('DB_PASSWORD'),
            logging,
            autoLoadModels: configService.get('DB_AUTO_LOAD_MODELS'),
            models,
          };
        }
        throw new Error(`Invalid database vendor: ${dbVendor}`);
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
