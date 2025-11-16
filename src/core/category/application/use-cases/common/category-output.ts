import type { Category } from '@core/category/domain/entities/category.entity';

export type CategoryOutput = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: Date;
};

export class CategoryOutputMapper {
  static toOutput(entity: Category): CategoryOutput {
    const { id, ...otherProps } = entity.toJSON();
    return {
      id,
      ...otherProps,
    };
  }
}
