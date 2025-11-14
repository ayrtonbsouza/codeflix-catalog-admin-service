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
import { CategoryModelMapper } from '@/category/infra/db/sequelize/mappers/category-model.mapper';

export class CategorySequelizeRepository
  implements ISearchableRepository<Category, Uuid>
{
  sortableFields: string[] = ['name', 'created_at'];

  constructor(private categoryModel: typeof CategoryModel) {}

  async insert(entity: Category): Promise<void> {
    const model = CategoryModelMapper.toModel(entity);
    await this.categoryModel.create(model.toJSON());
  }

  async bulkInsert(entities: Category[]): Promise<void> {
    const models = entities.map((entity) =>
      CategoryModelMapper.toModel(entity),
    );
    await this.categoryModel.bulkCreate(models.map((model) => model.toJSON()));
  }

  async update(entity: Category): Promise<void> {
    const model = await this._get(entity.id.value);
    if (!model) {
      throw new NotFoundError(entity.id.value, this.getEntity());
    }
    const modelToUpdate = CategoryModelMapper.toModel(entity);
    await this.categoryModel.update(modelToUpdate.toJSON(), {
      where: { id: entity.id.value },
    });
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
    return model ? CategoryModelMapper.toEntity(model) : null;
  }

  async findAll(): Promise<Category[]> {
    const models = await this.categoryModel.findAll();
    return models.map((model) => CategoryModelMapper.toEntity(model));
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
      items: models.map((model) => CategoryModelMapper.toEntity(model)),
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
