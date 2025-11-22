import { instanceToPlain } from 'class-transformer';
import { CollectionPresenter } from '../collection.presenter';
import {
  PaginationPresenter,
  type PaginationPresenterProps,
} from '../pagination.presenter';

// Classe concreta para testar a classe abstrata CollectionPresenter
class StubCollectionPresenter extends CollectionPresenter {
  data = [1, 2, 3];
}

describe('Unit: [CollectionPresenter]', () => {
  describe('[constructor]', () => {
    it('should set values', () => {
      // Arrange
      const props: PaginationPresenterProps = {
        current_page: 1,
        per_page: 2,
        last_page: 3,
        total: 4,
      };

      // Act
      const presenter = new StubCollectionPresenter(props);

      // Assert
      expect(presenter['paginationPresenter']).toBeInstanceOf(
        PaginationPresenter,
      );
      expect(presenter['paginationPresenter'].current_page).toBe(1);
      expect(presenter['paginationPresenter'].per_page).toBe(2);
      expect(presenter['paginationPresenter'].last_page).toBe(3);
      expect(presenter['paginationPresenter'].total).toBe(4);
      expect(presenter.meta).toEqual(presenter['paginationPresenter']);
    });

    it('should create a CollectionPresenter with valid pagination props', () => {
      // Arrange
      const props: PaginationPresenterProps = {
        current_page: 1,
        per_page: 10,
        last_page: 5,
        total: 50,
      };

      // Act
      const presenter = new StubCollectionPresenter(props);

      // Assert
      expect(presenter).toBeDefined();
      expect(presenter.meta).toBeInstanceOf(PaginationPresenter);
    });

    it('should initialize paginationPresenter with provided props', () => {
      // Arrange
      const props: PaginationPresenterProps = {
        current_page: 2,
        per_page: 20,
        last_page: 3,
        total: 60,
      };

      // Act
      const presenter = new StubCollectionPresenter(props);

      // Assert
      expect(presenter.meta.current_page).toBe(2);
      expect(presenter.meta.per_page).toBe(20);
      expect(presenter.meta.last_page).toBe(3);
      expect(presenter.meta.total).toBe(60);
    });
  });

  describe('[meta getter]', () => {
    it('should return a PaginationPresenter instance', () => {
      // Arrange
      const props: PaginationPresenterProps = {
        current_page: 1,
        per_page: 10,
        last_page: 5,
        total: 50,
      };
      const presenter = new StubCollectionPresenter(props);

      // Act
      const meta = presenter.meta;

      // Assert
      expect(meta).toBeInstanceOf(PaginationPresenter);
      expect(meta.current_page).toBe(1);
      expect(meta.per_page).toBe(10);
      expect(meta.last_page).toBe(5);
      expect(meta.total).toBe(50);
    });

    it('should return the same PaginationPresenter instance on multiple calls', () => {
      // Arrange
      const props: PaginationPresenterProps = {
        current_page: 1,
        per_page: 10,
        last_page: 5,
        total: 50,
      };
      const presenter = new StubCollectionPresenter(props);

      // Act
      const meta1 = presenter.meta;
      const meta2 = presenter.meta;

      // Assert
      expect(meta1).toBe(meta2);
    });

    it('should expose meta property with correct pagination values', () => {
      // Arrange
      const props: PaginationPresenterProps = {
        current_page: 3,
        per_page: 15,
        last_page: 10,
        total: 150,
      };
      const presenter = new StubCollectionPresenter(props);

      // Act
      const meta = presenter.meta;

      // Assert
      expect(meta.current_page).toBe(3);
      expect(meta.per_page).toBe(15);
      expect(meta.last_page).toBe(10);
      expect(meta.total).toBe(150);
    });
  });

  describe('[data getter]', () => {
    it('should return the data provided by the concrete implementation', () => {
      // Arrange
      const props: PaginationPresenterProps = {
        current_page: 1,
        per_page: 10,
        last_page: 1,
        total: 3,
      };
      const presenter = new StubCollectionPresenter(props);

      // Act
      const data = presenter.data;

      // Assert
      expect(data).toEqual([1, 2, 3]);
      expect(data).toHaveLength(3);
    });
  });

  describe('[instanceToPlain serialization]', () => {
    it('should presenter data with numeric values', () => {
      // Arrange
      const presenter = new StubCollectionPresenter({
        current_page: 1,
        per_page: 2,
        last_page: 3,
        total: 4,
      });

      // Act
      const result = instanceToPlain(presenter);

      // Assert
      expect(result).toStrictEqual({
        data: [1, 2, 3],
        meta: {
          current_page: 1,
          per_page: 2,
          last_page: 3,
          total: 4,
        },
      });
    });

    it('should transform string number values to numbers when serialized', () => {
      // Arrange
      const presenter = new StubCollectionPresenter({
        current_page: '1' as unknown as number,
        per_page: '2' as unknown as number,
        last_page: '3' as unknown as number,
        total: '4' as unknown as number,
      });

      // Act
      const result = instanceToPlain(presenter);

      // Assert
      expect(result).toStrictEqual({
        data: [1, 2, 3],
        meta: {
          current_page: 1,
          per_page: 2,
          last_page: 3,
          total: 4,
        },
      });
    });
  });

  describe('[integration with PaginationPresenter]', () => {
    it('should work correctly with different pagination scenarios', () => {
      // Arrange
      const scenarios: PaginationPresenterProps[] = [
        {
          current_page: 1,
          per_page: 10,
          last_page: 1,
          total: 5,
        },
        {
          current_page: 5,
          per_page: 20,
          last_page: 10,
          total: 200,
        },
        {
          current_page: 1,
          per_page: 1,
          last_page: 100,
          total: 100,
        },
      ];

      scenarios.forEach((props) => {
        // Act
        const presenter = new StubCollectionPresenter(props);

        // Assert
        expect(presenter.meta.current_page).toBe(props.current_page);
        expect(presenter.meta.per_page).toBe(props.per_page);
        expect(presenter.meta.last_page).toBe(props.last_page);
        expect(presenter.meta.total).toBe(props.total);
      });
    });
  });
});
