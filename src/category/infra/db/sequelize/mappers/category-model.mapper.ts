import { Category } from '@/category/domain/entities/category.entity';
import { CategoryModel } from '@/category/infra/db/sequelize/model/category.model';
import { Uuid } from '@/shared/domain/value-objects/uuid.vo';

export class CategoryModelMapper {
  static toModel(entity: Category): CategoryModel {
    return CategoryModel.build({
      id: entity.id.value,
      name: entity.name,
      description: entity.description,
      is_active: entity.is_active,
      created_at: entity.created_at,
    });
  }
  static toEntity(model: CategoryModel): Category {
    return new Category({
      id: new Uuid(model.id),
      name: model.name,
      description: model.description,
      is_active: model.is_active,
      created_at: model.created_at,
    });
  }
}
