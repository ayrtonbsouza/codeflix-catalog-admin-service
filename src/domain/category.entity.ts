export type CategoryConstructorProps = {
  id?: string;
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
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: Date;

  constructor(props: CategoryConstructorProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description ?? null;
    this.is_active = props.is_active ?? true;
    this.created_at = props.created_at ?? new Date();
  }

  static create(props: CreateCategoryProps): Category {
    return new Category(props);
  }
}
