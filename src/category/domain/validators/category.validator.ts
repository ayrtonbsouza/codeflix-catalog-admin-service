import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'
import type { Category } from '@/category/domain/entities/category.entity';
import { ClassValidatorFields } from '@/shared/domain/validators/class-validator-fields';

class CategoryRules {
  @MinLength(3)
  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description: string | null;

  @IsBoolean()
  is_active: boolean;

  constructor(...args: any[]) {
    const { name, description, is_active } = args[0] as Category;
    Object.assign(this, { name, description, is_active });
  }
}

export class CategoryValidator extends ClassValidatorFields<CategoryRules> {
  validate(entity: Category) {
    return super.validate(new CategoryRules(entity));
  }
}

export class CategoryValidatorFactory {
  static create() {
    return new CategoryValidator();
  }
}
