import { Uuid } from "@/shared/domain/value-objects/uuid.vo";
import { CategoryValidatorFactory } from "@/category/domain/validators/category.validator";

export type CategoryConstructorProps = {
  id?: Uuid;
  name: string;
  description?: string | null;
  is_active?: boolean;
  created_at?: Date;
}

export type CreateCategoryProps = {
  name: string;
  description?: string | null;
  is_active?: boolean;
}

export class Category {
  id: Uuid;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: Date;

  constructor(props: CategoryConstructorProps) {
    this.id = props.id ?? new Uuid();
    this.validateName(props.name);
    this.name = props.name;
    this.description = props.description ?? null;
    this.is_active = props.is_active ?? true;
    this.created_at = props.created_at ?? new Date();
  }

  private validateName(name: string): void {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('name should not be empty');
    }
  }

  static create(props: CreateCategoryProps): Category {
    return new Category(props);
  }

  static validate(entity: Category) {
    const validator = CategoryValidatorFactory.create();
    return validator.validate(entity);
  }

  changeName(name: string): void {
    this.validateName(name);
    this.name = name;
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

  toJSON() {
    return {
      id: this.id.value,
      name: this.name,
      description: this.description,
      is_active: this.is_active,
      created_at: this.created_at,
    }
  }
}
