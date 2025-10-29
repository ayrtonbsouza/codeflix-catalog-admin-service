import type { Category } from '@/category/domain/entities/category.entity';
import type { IRepository } from '@/shared/domain/repositories/repository.interface';
import type { Uuid } from '@/shared/domain/value-objects/uuid.vo';

export interface ICategoryRepository extends IRepository<Category, Uuid> {}
