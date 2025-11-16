import { MaxLength, MinLength } from 'class-validator';
import type { Category } from '@core/category/domain/entities/category.entity';
import { ClassValidatorFields } from '@core/shared/domain/validators/class-validator-fields';
import type { Notification } from '@core/shared/domain/validators/notification';

class CategoryRules {
  @MinLength(3, { groups: ['name'] })
  @MaxLength(255, { groups: ['name'] })
  name: string;

  constructor(entity: Category) {
    Object.assign(this, entity);
  }
}

export class CategoryValidator extends ClassValidatorFields {
  validate(notification: Notification, data: any, fields?: string[]): boolean {
    const newFields = fields?.length ? fields : ['name'];
    return super.validate(notification, new CategoryRules(data), newFields);
  }
}

export class CategoryValidatorFactory {
  static create() {
    return new CategoryValidator();
  }
}
