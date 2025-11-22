import { instanceToPlain } from 'class-transformer';
import {
  PaginationPresenter,
  type PaginationPresenterProps,
} from '../pagination.presenter';

describe('Unit: [PaginationPresenter]', () => {
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
      const presenter = new PaginationPresenter(props);

      // Assert
      expect(presenter.current_page).toBe(1);
      expect(presenter.per_page).toBe(2);
      expect(presenter.last_page).toBe(3);
      expect(presenter.total).toBe(4);
    });

    it('should set string number values', () => {
      // Arrange
      const props = {
        current_page: '1' as unknown as number,
        per_page: '2' as unknown as number,
        last_page: '3' as unknown as number,
        total: '4' as unknown as number,
      };

      // Act
      const presenter = new PaginationPresenter(props);

      // Assert
      expect(presenter.current_page).toBe('1');
      expect(presenter.per_page).toBe('2');
      expect(presenter.last_page).toBe('3');
      expect(presenter.total).toBe('4');
    });

    it('should create a PaginationPresenter with zero values', () => {
      // Arrange
      const props: PaginationPresenterProps = {
        current_page: 0,
        per_page: 0,
        last_page: 0,
        total: 0,
      };

      // Act
      const presenter = new PaginationPresenter(props);

      // Assert
      expect(presenter.current_page).toBe(0);
      expect(presenter.per_page).toBe(0);
      expect(presenter.last_page).toBe(0);
      expect(presenter.total).toBe(0);
    });

    it('should create a PaginationPresenter with large values', () => {
      // Arrange
      const props: PaginationPresenterProps = {
        current_page: 100,
        per_page: 50,
        last_page: 200,
        total: 10000,
      };

      // Act
      const presenter = new PaginationPresenter(props);

      // Assert
      expect(presenter.current_page).toBe(100);
      expect(presenter.per_page).toBe(50);
      expect(presenter.last_page).toBe(200);
      expect(presenter.total).toBe(10000);
    });

    it('should handle first page scenario', () => {
      // Arrange
      const props: PaginationPresenterProps = {
        current_page: 1,
        per_page: 10,
        last_page: 10,
        total: 100,
      };

      // Act
      const presenter = new PaginationPresenter(props);

      // Assert
      expect(presenter.current_page).toBe(1);
      expect(presenter.last_page).toBe(10);
    });

    it('should handle last page scenario', () => {
      // Arrange
      const props: PaginationPresenterProps = {
        current_page: 10,
        per_page: 10,
        last_page: 10,
        total: 100,
      };

      // Act
      const presenter = new PaginationPresenter(props);

      // Assert
      expect(presenter.current_page).toBe(10);
      expect(presenter.last_page).toBe(10);
    });

    it('should handle single page scenario', () => {
      // Arrange
      const props: PaginationPresenterProps = {
        current_page: 1,
        per_page: 10,
        last_page: 1,
        total: 5,
      };

      // Act
      const presenter = new PaginationPresenter(props);

      // Assert
      expect(presenter.current_page).toBe(1);
      expect(presenter.last_page).toBe(1);
      expect(presenter.total).toBe(5);
    });
  });

  describe('[properties]', () => {
    it('should have all required properties', () => {
      // Arrange
      const props: PaginationPresenterProps = {
        current_page: 2,
        per_page: 20,
        last_page: 3,
        total: 60,
      };

      // Act
      const presenter = new PaginationPresenter(props);

      // Assert
      expect(presenter).toHaveProperty('current_page');
      expect(presenter).toHaveProperty('per_page');
      expect(presenter).toHaveProperty('last_page');
      expect(presenter).toHaveProperty('total');
    });

    it('should allow property values to be modified', () => {
      // Arrange
      const props: PaginationPresenterProps = {
        current_page: 1,
        per_page: 10,
        last_page: 5,
        total: 50,
      };
      const presenter = new PaginationPresenter(props);

      // Act
      presenter.current_page = 2;
      presenter.per_page = 20;
      presenter.last_page = 3;
      presenter.total = 60;

      // Assert
      expect(presenter.current_page).toBe(2);
      expect(presenter.per_page).toBe(20);
      expect(presenter.last_page).toBe(3);
      expect(presenter.total).toBe(60);
    });
  });

  describe('[instanceToPlain serialization]', () => {
    it('should presenter data with numeric values', () => {
      // Arrange
      const presenter = new PaginationPresenter({
        current_page: 1,
        per_page: 2,
        last_page: 3,
        total: 4,
      });

      // Act
      const result = instanceToPlain(presenter);

      // Assert
      expect(result).toStrictEqual({
        current_page: 1,
        per_page: 2,
        last_page: 3,
        total: 4,
      });
    });

    it('should transform string number values to numbers when serialized', () => {
      // Arrange
      const presenter = new PaginationPresenter({
        current_page: '1' as unknown as number,
        per_page: '2' as unknown as number,
        last_page: '3' as unknown as number,
        total: '4' as unknown as number,
      });

      // Act
      const result = instanceToPlain(presenter);

      // Assert
      expect(result).toStrictEqual({
        current_page: 1,
        per_page: 2,
        last_page: 3,
        total: 4,
      });
    });
  });
});
