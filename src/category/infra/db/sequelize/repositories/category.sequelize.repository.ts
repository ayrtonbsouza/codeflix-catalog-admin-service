import { Category } from '@/category/domain/entities/category.entity';
import type { ISearchableRepository } from '@/shared/domain/repositories/repository.interface';
import { Uuid } from '@/shared/domain/value-objects/uuid.vo';
import type { CategoryModel } from '@/category/infra/db/sequelize/model/category.model';
import { NotFoundError } from '@/shared/domain/errors/not-found.error';
import {
  CategorySearchResult,
  type CategorySearchParams,
} from '@/category/domain/repositories/category.repository';
import { Op } from 'sequelize';

export class CategorySequelizeRepository
  implements ISearchableRepository<Category, Uuid>
{
  sortableFields: string[] = ['name', 'created_at'];

  constructor(private categoryModel: typeof CategoryModel) {}

  async insert(entity: Category): Promise<void> {
    await this.categoryModel.create({
      id: entity.id.value,
      name: entity.name,
      description: entity.description,
      is_active: entity.is_active,
      created_at: entity.created_at,
    });
  }

  async bulkInsert(entities: Category[]): Promise<void> {
    await this.categoryModel.bulkCreate(
      entities.map((entity) => ({
        id: entity.id.value,
        name: entity.name,
        description: entity.description,
        is_active: entity.is_active,
        created_at: entity.created_at,
      })),
    );
  }

  async update(entity: Category): Promise<void> {
    const model = await this._get(entity.id.value);
    if (!model) {
      throw new NotFoundError(entity.id.value, this.getEntity());
    }
    await this.categoryModel.update(
      {
        name: entity.name,
        description: entity.description,
        is_active: entity.is_active,
      },
      {
        where: {
          id: entity.id.value,
        },
      },
    );
  }

  async delete(id: Uuid): Promise<void> {
    const model = await this._get(id.value);
    if (!model) {
      throw new NotFoundError(id.value, this.getEntity());
    }
    await this.categoryModel.destroy({ where: { id: id.value } });
  }

  async findById(id: Uuid): Promise<Category | null> {
    const model = await this._get(id.value);
    return new Category({
      id: new Uuid(model.id),
      name: model.name,
      description: model.description,
      is_active: model.is_active,
      created_at: model.created_at,
    });
  }

  async findAll(): Promise<Category[]> {
    const models = await this.categoryModel.findAll();
    return models.map(
      (model) =>
        new Category({
          id: new Uuid(model.id),
          name: model.name,
          description: model.description,
          is_active: model.is_active,
          created_at: model.created_at,
        }),
    );
  }

  async search(props: CategorySearchParams): Promise<CategorySearchResult> {
    const offset = (props.page - 1) * props.per_page;
    const limit = props.per_page;

    const { rows: models, count } = await this.categoryModel.findAndCountAll({
      ...(props.filter && {
        where: { name: { [Op.like]: `%${props.filter}%` } },
      }),
      ...(props.sort && this.sortableFields.includes(props.sort)
        ? { order: [[props.sort, props.sort_dir]] }
        : { order: [['created_at', 'desc']] }),
      offset,
      limit,
    });

    return new CategorySearchResult({
      items: models.map((model) => {
        return new Category({
          id: new Uuid(model.id),
          name: model.name,
          description: model.description,
          is_active: model.is_active,
          created_at: model.created_at,
        });
      }),
      total: count,
      current_page: props.page,
      per_page: props.per_page,
    });
  }

  private async _get(id: string): Promise<CategoryModel> {
    return await this.categoryModel.findByPk(id);
  }

  getEntity(): new (...args: any[]) => Category {
    return Category;
  }
}
