import type { ValueObject } from '@/shared/domain/entities/value-object';

export abstract class Entity {
  abstract get entity_id(): ValueObject;
  abstract toJSON(): any;
}
