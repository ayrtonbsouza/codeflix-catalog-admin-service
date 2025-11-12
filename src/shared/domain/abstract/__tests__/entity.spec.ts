import { Entity } from '@/shared/domain/abstract/entity';
import { ValueObject } from '@/shared/domain/abstract/value-object';
import { Uuid } from '@/shared/domain/value-objects/uuid.vo';

let callCount = 0;
const uuidValues = [
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440003',
];

jest.mock('uuid', () => ({
  v4: jest.fn(() => {
    const value = uuidValues[callCount % uuidValues.length];
    callCount++;
    return value;
  }),
  validate: jest.fn((value: string) => {
    if (!value || value.length === 0) {
      return false;
    }
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }),
}));

class EntityStub extends Entity {
  public id: Uuid;
  public name: string;

  constructor(props: { id: Uuid; name: string }) {
    super();
    this.id = props.id;
    this.name = props.name;
  }

  get entity_id(): ValueObject {
    return this.id;
  }

  toJSON() {
    return {
      id: this.id.value,
      name: this.name,
    };
  }
}

describe('Unit: [Entity Abstract Class]', () => {
  beforeEach(() => {
    callCount = 0;
    jest.clearAllMocks();
  });

  describe('[entity_id]', () => {
    it('should return the entity id as ValueObject', () => {
      // Arrange
      const customUuid = new Uuid('550e8400-e29b-41d4-a716-446655440000');
      const entity = new EntityStub({ id: customUuid, name: 'Test Entity' });

      // Act
      const entityId = entity.entity_id;

      // Assert
      expect(entityId).toBeInstanceOf(Uuid);
      expect(entityId).toBe(customUuid);
    });

    it('should return a ValueObject when calling entity_id', () => {
      // Arrange
      const customUuid = new Uuid('550e8400-e29b-41d4-a716-446655440001');
      const entity = new EntityStub({ id: customUuid, name: 'Test Entity' });

      // Act
      const entityId = entity.entity_id as Uuid;

      // Assert
      expect(entityId).toBeInstanceOf(ValueObject);
      expect(entityId.value).toBe('550e8400-e29b-41d4-a716-446655440001');
    });

    it('should return consistent entity_id on multiple calls', () => {
      // Arrange
      const customUuid = new Uuid('550e8400-e29b-41d4-a716-446655440002');
      const entity = new EntityStub({ id: customUuid, name: 'Test Entity' });

      // Act
      const entityId1 = entity.entity_id as Uuid;
      const entityId2 = entity.entity_id as Uuid;

      // Assert
      expect(entityId1).toBe(entityId2);
      expect(entityId1.value).toBe(entityId2.value);
    });

    it('should return a ValueObject with equals method', () => {
      // Arrange
      const customUuid1 = new Uuid('550e8400-e29b-41d4-a716-446655440000');
      const customUuid2 = new Uuid('550e8400-e29b-41d4-a716-446655440001');
      const entity1 = new EntityStub({ id: customUuid1, name: 'Entity 1' });
      const entity2 = new EntityStub({ id: customUuid2, name: 'Entity 2' });

      // Act
      const entityId1 = entity1.entity_id;
      const entityId2 = entity2.entity_id;

      // Assert
      expect(entityId1.equals(entityId2)).toBe(false);
      expect(entityId1.equals(entityId1)).toBe(true);
    });

    it('should return the same Uuid instance from entity_id', () => {
      // Arrange
      const customUuid = new Uuid('550e8400-e29b-41d4-a716-446655440003');
      const entity = new EntityStub({ id: customUuid, name: 'Test Entity' });

      // Act
      const entityId = entity.entity_id;
      const entityIdAgain = entity.entity_id;

      // Assert
      expect(entityId).toBe(entity.id);
      expect(entityIdAgain).toBe(entity.id);
      expect(entityId).toBe(entityIdAgain);
    });
  });

  describe('[toJSON]', () => {
    it('should return a JSON representation of the entity', () => {
      // Arrange
      const customUuid = new Uuid('550e8400-e29b-41d4-a716-446655440000');
      const entity = new EntityStub({ id: customUuid, name: 'Test Entity' });

      // Act
      const json = entity.toJSON();

      // Assert
      expect(json).toEqual({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Test Entity',
      });
    });

    it('should convert entity_id value to string in JSON', () => {
      // Arrange
      const customUuid = new Uuid('550e8400-e29b-41d4-a716-446655440001');
      const entity = new EntityStub({ id: customUuid, name: 'Test' });

      // Act
      const json = entity.toJSON();

      // Assert
      expect(typeof json.id).toBe('string');
      expect(json.id).toBe(customUuid.value);
    });
  });

  describe('[entity_id integration with toJSON]', () => {
    it('should have entity_id that matches id in JSON', () => {
      // Arrange
      const customUuid = new Uuid('550e8400-e29b-41d4-a716-446655440000');
      const entity = new EntityStub({ id: customUuid, name: 'Test Entity' });

      // Act
      const entityId = entity.entity_id as Uuid;
      const json = entity.toJSON();

      // Assert
      expect(entityId.value).toBe(json.id);
    });

    it('should maintain consistency between entity_id and JSON id', () => {
      // Arrange
      const customUuid = new Uuid('550e8400-e29b-41d4-a716-446655440002');
      const entity = new EntityStub({ id: customUuid, name: 'Test' });

      // Act
      const entityId = entity.entity_id as Uuid;
      const json = entity.toJSON();

      // Assert
      expect(entityId.value).toBe(json.id);
      expect(json.id).toBe('550e8400-e29b-41d4-a716-446655440002');
    });
  });
});
