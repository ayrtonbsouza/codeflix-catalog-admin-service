import { Uuid } from '@/shared/domain/value-objects/uuid.vo';
import { CategoryValidatorFactory } from '@/category/domain/validators/category.validator';
import { EntityValidationError } from '@/shared/domain/validators/validation.error';
import { Entity } from '@/shared/domain/abstract/entity';
import type { ValueObject } from '@/shared/domain/abstract/value-object';

export type CategoryConstructorProps = {
  id?: Uuid;
  name: string;
  description?: string | null;
  is_active?: boolean;
  created_at?: Date;
};

export type CreateCategoryProps = {
  name: string;
  description?: string | null;
  is_active?: boolean;
};

export class Category extends Entity {
  id: Uuid;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: Date;

  constructor(props: CategoryConstructorProps) {
    super();
    this.id = props.id ?? new Uuid();
    this.name = props.name;
    this.description = props.description ?? null;
    this.is_active = props.is_active ?? true;
    this.created_at = props.created_at ?? new Date();
  }

  static create(props: CreateCategoryProps): Category {
    const category = new Category(props);
    Category.validate(category);
    return category;
  }

  static validate(entity: Category) {
    const validator = CategoryValidatorFactory.create();
    const isValid = validator.validate(entity);

    if (!isValid) {
      throw new EntityValidationError(validator.errors);
    }
  }

  changeName(name: string): void {
    this.name = name;
    Category.validate(this);
  }

  changeDescription(description: string): void {
    this.description = description;
    Category.validate(this);
  }

  activate(): void {
    this.is_active = true;
  }

  deactivate(): void {
    this.is_active = false;
  }

  get entity_id(): ValueObject {
    return this.id;
  }

  toJSON() {
    return {
      id: this.id.value,
      name: this.name,
      description: this.description,
      is_active: this.is_active,
      created_at: this.created_at,
    };
  }
}
