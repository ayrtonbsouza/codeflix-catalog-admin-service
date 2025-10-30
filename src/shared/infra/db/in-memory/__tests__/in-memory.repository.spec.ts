jest.mock('uuid', () => ({
  v4: () => '550e8400-e29b-41d4-a716-446655440000',
  validate: () => true,
}));

import { InMemoryRepository } from '@/shared/infra/db/in-memory/in-memory.repository';
import { Entity } from '@/shared/domain/abstract/entity';
import type { ValueObject } from '@/shared/domain/abstract/value-object';
import { Uuid } from '@/shared/domain/value-objects/uuid.vo';
import { NotFoundError } from '@/shared/domain/errors/not-found.error';

class TestEntity extends Entity {
  id: Uuid;
  name: string;

  constructor(props: { id?: Uuid; name: string }) {
    super();
    this.id = props.id ?? new Uuid();
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

class TestInMemoryRepository extends InMemoryRepository<TestEntity, Uuid> {
  getEntity(): new (...args: any[]) => TestEntity {
    return TestEntity;
  }
}

describe('[InMemoryRepository]', () => {
  let repository: TestInMemoryRepository;

  beforeEach(() => {
    repository = new TestInMemoryRepository();
  });

  describe('[findById]', () => {
    it('deve retornar null quando a entidade não existir', async () => {
      const id = new Uuid();
      const result = await repository.findById(id);
      expect(result).toBeNull();
    });

    it('deve retornar a entidade quando existir', async () => {
      const entity = new TestEntity({ name: 'Teste' });
      await repository.insert(entity);

      const result = await repository.findById(entity.id);
      expect(result).toBeInstanceOf(TestEntity);
      expect(result?.toJSON()).toEqual(entity.toJSON());
    });
  });

  describe('[findAll]', () => {
    it('deve retornar uma lista vazia inicialmente', async () => {
      const result = await repository.findAll();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    it('deve retornar todas as entidades após inserções', async () => {
      const entities = [
        new TestEntity({ name: 'A' }),
        new TestEntity({ name: 'B' }),
      ];
      await repository.bulkInsert(entities);

      const result = await repository.findAll();
      expect(result).toHaveLength(2);
      expect(result.map((e) => e.toJSON())).toEqual(
        entities.map((e) => e.toJSON()),
      );
    });
  });

  describe('[insert]', () => {
    it('deve inserir uma entidade', async () => {
      const entity = new TestEntity({ name: 'Novo' });
      await repository.insert(entity);

      const all = await repository.findAll();
      expect(all).toHaveLength(1);
      expect(all[0].toJSON()).toEqual(entity.toJSON());
    });
  });

  describe('[bulkInsert]', () => {
    it('deve inserir múltiplas entidades', async () => {
      const entities = [
        new TestEntity({ name: 'E1' }),
        new TestEntity({ name: 'E2' }),
        new TestEntity({ name: 'E3' }),
      ];
      await repository.bulkInsert(entities);

      const all = await repository.findAll();
      expect(all).toHaveLength(3);
      expect(all.map((e) => e.toJSON())).toEqual(
        entities.map((e) => e.toJSON()),
      );
    });
  });

  describe('[update]', () => {
    it('deve lançar NotFoundError quando a entidade não existir', async () => {
      const entity = new TestEntity({ name: 'Inexistente' });
      await expect(repository.update(entity)).rejects.toBeInstanceOf(
        NotFoundError,
      );
      await expect(repository.update(entity)).rejects.toThrow(
        `${TestEntity.name} not found with id ${entity.id.value}`,
      );
    });

    it('deve atualizar a entidade existente', async () => {
      const entity = new TestEntity({ name: 'Antes' });
      await repository.insert(entity);

      const updated = new TestEntity({ id: entity.id, name: 'Depois' });
      await repository.update(updated);

      const found = await repository.findById(entity.id);
      expect(found?.name).toBe('Depois');
      expect(found?.toJSON()).toEqual(updated.toJSON());
    });
  });

  describe('[delete]', () => {
    it('deve lançar NotFoundError quando o id não existir', async () => {
      const id = new Uuid();
      await expect(repository.delete(id)).rejects.toBeInstanceOf(NotFoundError);
      await expect(repository.delete(id)).rejects.toThrow(
        `${TestEntity.name} not found with id ${id.value}`,
      );
    });

    it('deve remover a entidade existente', async () => {
      const entity = new TestEntity({ name: 'Remover' });
      await repository.insert(entity);

      await repository.delete(entity.id);

      const all = await repository.findAll();
      expect(all).toHaveLength(0);
      const found = await repository.findById(entity.id);
      expect(found).toBeNull();
    });
  });
});
