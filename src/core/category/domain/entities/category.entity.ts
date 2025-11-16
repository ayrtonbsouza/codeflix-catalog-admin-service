import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { CategoryValidatorFactory } from '@core/category/domain/validators/category.validator';
import { Entity } from '@core/shared/domain/entities/entity';
import type { ValueObject } from '@core/shared/domain/entities/value-object';
import { CategoryFakeBuilder } from '@core/category/domain/builders/category-fake.builder';

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
    category.validate(['name']);
    return category;
  }

  validate(fields?: string[]) {
    const validator = CategoryValidatorFactory.create();
    return validator.validate(this.notification, this, fields);
  }

  changeName(name: string): void {
    this.name = name;
    this.validate(['name']);
  }

  changeDescription(description: string): void {
    this.description = description;
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

  static fake() {
    return CategoryFakeBuilder;
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
