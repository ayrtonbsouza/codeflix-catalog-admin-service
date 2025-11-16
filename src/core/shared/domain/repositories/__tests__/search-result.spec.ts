import { Entity } from '@core/shared/domain/entities/entity';
import { ValueObject } from '@core/shared/domain/entities/value-object';
import { Uuid } from '@core/shared/domain/value-objects/uuid.vo';
import { SearchResult } from '@core/shared/domain/repositories/search-result';

let callCount = 0;
const uuidValues = [
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440004',
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

describe('Unit: [SearchResult]', () => {
  beforeEach(() => {
    callCount = 0;
    jest.clearAllMocks();
  });

  describe('[constructor]', () => {
    it('should create SearchResult with provided values', () => {
      // Arrange
      const items = [
        new EntityStub({
          id: new Uuid('550e8400-e29b-41d4-a716-446655440000'),
          name: 'Entity 1',
        }),
        new EntityStub({
          id: new Uuid('550e8400-e29b-41d4-a716-446655440001'),
          name: 'Entity 2',
        }),
      ];
      const props = {
        items,
        total: 2,
        current_page: 1,
        per_page: 15,
      };

      // Act
      const searchResult = new SearchResult(props);

      // Assert
      expect(searchResult.items).toEqual(items);
      expect(searchResult.total).toBe(2);
      expect(searchResult.current_page).toBe(1);
      expect(searchResult.per_page).toBe(15);
    });

    it('should create SearchResult with empty items array', () => {
      // Arrange
      const props = {
        items: [] as EntityStub[],
        total: 0,
        current_page: 1,
        per_page: 15,
      };

      // Act
      const searchResult = new SearchResult(props);

      // Assert
      expect(searchResult.items).toEqual([]);
      expect(searchResult.total).toBe(0);
      expect(searchResult.current_page).toBe(1);
      expect(searchResult.per_page).toBe(15);
    });

    it('should calculate last_page correctly when total is divisible by per_page', () => {
      // Arrange
      const items = Array.from(
        { length: 15 },
        (_, i) =>
          new EntityStub({
            id: new Uuid(),
            name: `Entity ${i + 1}`,
          }),
      );
      const props = {
        items,
        total: 30,
        current_page: 1,
        per_page: 15,
      };

      // Act
      const searchResult = new SearchResult(props);

      // Assert
      expect(searchResult.last_page).toBe(2);
    });

    it('should calculate last_page correctly when total is not divisible by per_page', () => {
      // Arrange
      const items = Array.from(
        { length: 10 },
        (_, i) =>
          new EntityStub({
            id: new Uuid(),
            name: `Entity ${i + 1}`,
          }),
      );
      const props = {
        items,
        total: 25,
        current_page: 1,
        per_page: 10,
      };

      // Act
      const searchResult = new SearchResult(props);

      // Assert
      expect(searchResult.last_page).toBe(3);
    });

    it('should calculate last_page as 0 when total is 0', () => {
      // Arrange
      const props = {
        items: [] as EntityStub[],
        total: 0,
        current_page: 1,
        per_page: 15,
      };

      // Act
      const searchResult = new SearchResult(props);

      // Assert
      expect(searchResult.last_page).toBe(0);
    });

    it('should calculate last_page correctly when total is less than per_page', () => {
      // Arrange
      const items = Array.from(
        { length: 5 },
        (_, i) =>
          new EntityStub({
            id: new Uuid(),
            name: `Entity ${i + 1}`,
          }),
      );
      const props = {
        items,
        total: 5,
        current_page: 1,
        per_page: 15,
      };

      // Act
      const searchResult = new SearchResult(props);

      // Assert
      expect(searchResult.last_page).toBe(1);
    });
  });

  describe('[last_page]', () => {
    it('should calculate last_page correctly for various scenarios', () => {
      // Arrange & Act
      const result1 = new SearchResult({
        items: [],
        total: 100,
        current_page: 1,
        per_page: 10,
      });
      const result2 = new SearchResult({
        items: [],
        total: 101,
        current_page: 1,
        per_page: 10,
      });
      const result3 = new SearchResult({
        items: [],
        total: 1,
        current_page: 1,
        per_page: 10,
      });

      // Assert
      expect(result1.last_page).toBe(10);
      expect(result2.last_page).toBe(11);
      expect(result3.last_page).toBe(1);
    });

    it('should round up last_page when there is remainder', () => {
      // Arrange & Act
      const result = new SearchResult({
        items: [],
        total: 23,
        current_page: 1,
        per_page: 5,
      });

      // Assert
      expect(result.last_page).toBe(5);
    });
  });

  describe('[toJSON]', () => {
    it('should return JSON representation with items as entities when forceEntity is false', () => {
      // Arrange
      const entity1 = new EntityStub({
        id: new Uuid('550e8400-e29b-41d4-a716-446655440000'),
        name: 'Entity 1',
      });
      const entity2 = new EntityStub({
        id: new Uuid('550e8400-e29b-41d4-a716-446655440001'),
        name: 'Entity 2',
      });
      const searchResult = new SearchResult({
        items: [entity1, entity2],
        total: 2,
        current_page: 1,
        per_page: 15,
      });

      // Act
      const json = searchResult.toJSON();

      // Assert
      expect(json).toEqual({
        items: [entity1, entity2],
        total: 2,
        current_page: 1,
        per_page: 15,
        last_page: 1,
      });
    });

    it('should return JSON representation with items as JSON when forceEntity is true', () => {
      // Arrange
      const entity1 = new EntityStub({
        id: new Uuid('550e8400-e29b-41d4-a716-446655440000'),
        name: 'Entity 1',
      });
      const entity2 = new EntityStub({
        id: new Uuid('550e8400-e29b-41d4-a716-446655440001'),
        name: 'Entity 2',
      });
      const searchResult = new SearchResult({
        items: [entity1, entity2],
        total: 2,
        current_page: 1,
        per_page: 15,
      });

      // Act
      const json = searchResult.toJSON(true);

      // Assert
      expect(json).toEqual({
        items: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'Entity 1',
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440001',
            name: 'Entity 2',
          },
        ],
        total: 2,
        current_page: 1,
        per_page: 15,
        last_page: 1,
      });
    });

    it('should return JSON with empty items array', () => {
      // Arrange
      const searchResult = new SearchResult({
        items: [],
        total: 0,
        current_page: 1,
        per_page: 15,
      });

      // Act
      const json = searchResult.toJSON();

      // Assert
      expect(json).toEqual({
        items: [],
        total: 0,
        current_page: 1,
        per_page: 15,
        last_page: 0,
      });
    });

    it('should return JSON with correct pagination info', () => {
      // Arrange
      const items = Array.from(
        { length: 10 },
        (_, i) =>
          new EntityStub({
            id: new Uuid(),
            name: `Entity ${i + 1}`,
          }),
      );
      const searchResult = new SearchResult({
        items,
        total: 50,
        current_page: 2,
        per_page: 10,
      });

      // Act
      const json = searchResult.toJSON();

      // Assert
      expect(json).toEqual({
        items,
        total: 50,
        current_page: 2,
        per_page: 10,
        last_page: 5,
      });
    });
  });

  describe('[equals]', () => {
    it('should return true when comparing two SearchResults with same values', () => {
      // Arrange
      const entity1 = new EntityStub({
        id: new Uuid('550e8400-e29b-41d4-a716-446655440000'),
        name: 'Entity 1',
      });
      const entity2 = new EntityStub({
        id: new Uuid('550e8400-e29b-41d4-a716-446655440001'),
        name: 'Entity 2',
      });
      const props = {
        items: [entity1, entity2],
        total: 2,
        current_page: 1,
        per_page: 15,
      };
      const searchResult1 = new SearchResult(props);
      const searchResult2 = new SearchResult(props);

      // Act
      const result = searchResult1.equals(searchResult2);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when comparing two SearchResults with different items', () => {
      // Arrange
      const entity1 = new EntityStub({
        id: new Uuid('550e8400-e29b-41d4-a716-446655440000'),
        name: 'Entity 1',
      });
      const entity2 = new EntityStub({
        id: new Uuid('550e8400-e29b-41d4-a716-446655440001'),
        name: 'Entity 2',
      });
      const searchResult1 = new SearchResult({
        items: [entity1],
        total: 1,
        current_page: 1,
        per_page: 15,
      });
      const searchResult2 = new SearchResult({
        items: [entity2],
        total: 1,
        current_page: 1,
        per_page: 15,
      });

      // Act
      const result = searchResult1.equals(searchResult2);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when comparing two SearchResults with different total', () => {
      // Arrange
      const entity1 = new EntityStub({
        id: new Uuid('550e8400-e29b-41d4-a716-446655440000'),
        name: 'Entity 1',
      });
      const searchResult1 = new SearchResult({
        items: [entity1],
        total: 1,
        current_page: 1,
        per_page: 15,
      });
      const searchResult2 = new SearchResult({
        items: [entity1],
        total: 2,
        current_page: 1,
        per_page: 15,
      });

      // Act
      const result = searchResult1.equals(searchResult2);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when comparing two SearchResults with different current_page', () => {
      // Arrange
      const entity1 = new EntityStub({
        id: new Uuid('550e8400-e29b-41d4-a716-446655440000'),
        name: 'Entity 1',
      });
      const searchResult1 = new SearchResult({
        items: [entity1],
        total: 1,
        current_page: 1,
        per_page: 15,
      });
      const searchResult2 = new SearchResult({
        items: [entity1],
        total: 1,
        current_page: 2,
        per_page: 15,
      });

      // Act
      const result = searchResult1.equals(searchResult2);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when comparing two SearchResults with different per_page', () => {
      // Arrange
      const entity1 = new EntityStub({
        id: new Uuid('550e8400-e29b-41d4-a716-446655440000'),
        name: 'Entity 1',
      });
      const searchResult1 = new SearchResult({
        items: [entity1],
        total: 1,
        current_page: 1,
        per_page: 15,
      });
      const searchResult2 = new SearchResult({
        items: [entity1],
        total: 1,
        current_page: 1,
        per_page: 20,
      });

      // Act
      const result = searchResult1.equals(searchResult2);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when comparing with null', () => {
      // Arrange
      const searchResult = new SearchResult({
        items: [],
        total: 0,
        current_page: 1,
        per_page: 15,
      });

      // Act
      const result = searchResult.equals(null as any);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when comparing with undefined', () => {
      // Arrange
      const searchResult = new SearchResult({
        items: [],
        total: 0,
        current_page: 1,
        per_page: 15,
      });

      // Act
      const result = searchResult.equals(undefined as any);

      // Assert
      expect(result).toBe(false);
    });

    it('should return true when comparing SearchResult with itself', () => {
      // Arrange
      const searchResult = new SearchResult({
        items: [],
        total: 0,
        current_page: 1,
        per_page: 15,
      });

      // Act
      const result = searchResult.equals(searchResult);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('[integrated behaviors]', () => {
    it('should create SearchResult and calculate last_page correctly', () => {
      // Arrange
      const items = Array.from(
        { length: 20 },
        (_, i) =>
          new EntityStub({
            id: new Uuid(),
            name: `Entity ${i + 1}`,
          }),
      );

      // Act
      const searchResult = new SearchResult({
        items,
        total: 100,
        current_page: 2,
        per_page: 20,
      });

      // Assert
      expect(searchResult.items.length).toBe(20);
      expect(searchResult.total).toBe(100);
      expect(searchResult.current_page).toBe(2);
      expect(searchResult.per_page).toBe(20);
      expect(searchResult.last_page).toBe(5);
    });

    it('should handle SearchResult with toJSON and equals together', () => {
      // Arrange
      const entity1 = new EntityStub({
        id: new Uuid('550e8400-e29b-41d4-a716-446655440000'),
        name: 'Entity 1',
      });
      const searchResult1 = new SearchResult({
        items: [entity1],
        total: 1,
        current_page: 1,
        per_page: 15,
      });
      const searchResult2 = new SearchResult({
        items: [entity1],
        total: 1,
        current_page: 1,
        per_page: 15,
      });

      // Act
      const json = searchResult1.toJSON(true);
      const areEqual = searchResult1.equals(searchResult2);

      // Assert
      expect(json.items[0]).toEqual({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Entity 1',
      });
      expect(areEqual).toBe(true);
    });

    it('should maintain consistency between properties and calculated last_page', () => {
      // Arrange
      const items = Array.from(
        { length: 5 },
        (_, i) =>
          new EntityStub({
            id: new Uuid(),
            name: `Entity ${i + 1}`,
          }),
      );

      // Act
      const searchResult = new SearchResult({
        items,
        total: 47,
        current_page: 3,
        per_page: 5,
      });

      // Assert
      expect(searchResult.total / searchResult.per_page).toBe(9.4);
      expect(searchResult.last_page).toBe(10);
      expect(searchResult.current_page).toBe(3);
    });
  });
});
