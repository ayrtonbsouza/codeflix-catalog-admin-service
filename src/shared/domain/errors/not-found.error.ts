/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import type { Entity } from '@/shared/domain/abstract/entity';

export class NotFoundError extends Error {
  constructor(id: any[] | any, entityClass: new (...args: any[]) => Entity) {
    const idsMessage = Array.isArray(id) ? id.join(', ') : id;
    super(`${entityClass.name} not found with id ${idsMessage}`);
    this.name = 'NotFoundError';
  }
}
