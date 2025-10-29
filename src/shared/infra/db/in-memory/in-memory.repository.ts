import type { Entity } from '@/shared/domain/abstract/entity';
import type { ValueObject } from '@/shared/domain/abstract/value-object';
import type { IRepository } from '@/shared/domain/repositories/repository.interface';

export abstract class InMemoryRepository<
  E extends Entity,
  EntityId extends ValueObject,
> implements IRepository<E, EntityId>
{
  private entities: E[] = [];

  async findById(id: EntityId): Promise<E | null> {
    const item = this.entities.find((item) => item.entity_id.equals(id));
    return Promise.resolve(typeof item !== 'undefined' ? item : null);
  }

  async findAll(): Promise<E[]> {
    return Promise.resolve(this.entities);
  }

  abstract getEntity(): new (...args: any[]) => E;

  async insert(entity: E): Promise<void> {
    this.entities.push(entity);
    return Promise.resolve();
  }

  async bulkInsert(entities: E[]): Promise<void> {
    this.entities.push(...entities);
    return Promise.resolve();
  }

  async update(entity: E): Promise<void> {
    const foundIndex = this.entities.findIndex((item) =>
      item.entity_id.equals(entity.entity_id),
    );
    if (foundIndex === -1) {
      throw new Error('Entity not found');
    }
    this.entities[foundIndex] = entity;
    return Promise.resolve();
  }

  async delete(id: EntityId): Promise<void> {
    const foundIndex = this.entities.findIndex((item) =>
      item.entity_id.equals(id),
    );
    if (foundIndex === -1) {
      throw new Error('Entity not found');
    }
    this.entities.splice(foundIndex, 1);
    return Promise.resolve();
  }
}
