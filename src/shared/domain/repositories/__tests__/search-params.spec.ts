import {
  SearchParams,
  type SortDirection,
} from '@/shared/domain/repositories/search-params';

describe('Unit: [SearchParams]', () => {
  describe('[constructor]', () => {
    it('should create SearchParams with default values when no props provided', () => {
      // Arrange & Act
      const searchParams = new SearchParams();

      // Assert
      expect(searchParams.page).toBe(1);
      expect(searchParams.per_page).toBe(15);
      expect(searchParams.sort).toBeNull();
      expect(searchParams.sort_dir).toBeNull();
      expect(searchParams.filter).toBeNull();
    });

    it('should create SearchParams with provided values', () => {
      // Arrange
      const props = {
        page: 2,
        per_page: 20,
        sort: 'name',
        sort_dir: 'asc' as SortDirection,
        filter: 'test',
      };

      // Act
      const searchParams = new SearchParams(props);

      // Assert
      expect(searchParams.page).toBe(2);
      expect(searchParams.per_page).toBe(20);
      expect(searchParams.sort).toBe('name');
      expect(searchParams.sort_dir).toBe('asc');
      expect(searchParams.filter).toBe('test');
    });

    it('should create SearchParams with partial props', () => {
      // Arrange
      const props = {
        page: 3,
        sort: 'created_at',
      };

      // Act
      const searchParams = new SearchParams(props);

      // Assert
      expect(searchParams.page).toBe(3);
      expect(searchParams.per_page).toBe(15);
      expect(searchParams.sort).toBe('created_at');
      expect(searchParams.sort_dir).toBe('asc');
      expect(searchParams.filter).toBeNull();
    });
  });

  describe('[page]', () => {
    it('should set page to 1 when value is NaN', () => {
      // Arrange & Act
      const searchParams = new SearchParams({ page: NaN as any });

      // Assert
      expect(searchParams.page).toBe(1);
    });

    it('should set page to 1 when value is 0', () => {
      // Arrange & Act
      const searchParams = new SearchParams({ page: 0 });

      // Assert
      expect(searchParams.page).toBe(1);
    });

    it('should set page to 1 when value is negative', () => {
      // Arrange & Act
      const searchParams = new SearchParams({ page: -5 });

      // Assert
      expect(searchParams.page).toBe(1);
    });

    it('should set page to 1 when value is a float', () => {
      // Arrange & Act
      const searchParams = new SearchParams({ page: 2.5 });

      // Assert
      expect(searchParams.page).toBe(1);
    });

    it('should set page to 1 when value is undefined', () => {
      // Arrange & Act
      const searchParams = new SearchParams({ page: undefined as any });

      // Assert
      expect(searchParams.page).toBe(1);
    });

    it('should accept valid positive integer page', () => {
      // Arrange & Act
      const searchParams = new SearchParams({ page: 5 });

      // Assert
      expect(searchParams.page).toBe(5);
    });

    it('should convert string number to integer', () => {
      // Arrange & Act
      const searchParams = new SearchParams({ page: '10' as any });

      // Assert
      expect(searchParams.page).toBe(10);
    });
  });

  describe('[per_page]', () => {
    it('should set per_page to default (15) when value is NaN', () => {
      // Arrange & Act
      const searchParams = new SearchParams({ per_page: NaN as any });

      // Assert
      expect(searchParams.per_page).toBe(15);
    });

    it('should set per_page to default (15) when value is 0', () => {
      // Arrange & Act
      const searchParams = new SearchParams({ per_page: 0 });

      // Assert
      expect(searchParams.per_page).toBe(15);
    });

    it('should set per_page to default (15) when value is negative', () => {
      // Arrange & Act
      const searchParams = new SearchParams({ per_page: -10 });

      // Assert
      expect(searchParams.per_page).toBe(15);
    });

    it('should set per_page to default (15) when value is a float', () => {
      // Arrange & Act
      const searchParams = new SearchParams({ per_page: 20.7 });

      // Assert
      expect(searchParams.per_page).toBe(15);
    });

    it('should set per_page to default (15) when value is undefined', () => {
      // Arrange & Act
      const searchParams = new SearchParams({ per_page: undefined as any });

      // Assert
      expect(searchParams.per_page).toBe(15);
    });

    it('should accept valid positive integer per_page', () => {
      // Arrange & Act
      const searchParams = new SearchParams({ per_page: 25 });

      // Assert
      expect(searchParams.per_page).toBe(25);
    });

    it('should convert string number to integer', () => {
      // Arrange & Act
      const searchParams = new SearchParams({ per_page: '30' as any });

      // Assert
      expect(searchParams.per_page).toBe(30);
    });

    it('should keep current per_page when value is true', () => {
      // Arrange
      const searchParams1 = new SearchParams({ per_page: 20 });
      const searchParams2 = new SearchParams({ per_page: true as any });

      // Assert
      expect(searchParams1.per_page).toBe(20);
      expect(searchParams2.per_page).toBe(15);
    });
  });

  describe('[sort]', () => {
    it('should set sort to null when value is null', () => {
      // Arrange & Act
      const searchParams = new SearchParams({ sort: null });

      // Assert
      expect(searchParams.sort).toBeNull();
    });

    it('should set sort to null when value is undefined', () => {
      // Arrange & Act
      const searchParams = new SearchParams({ sort: undefined as any });

      // Assert
      expect(searchParams.sort).toBeNull();
    });

    it('should set sort to null when value is empty string', () => {
      // Arrange & Act
      const searchParams = new SearchParams({ sort: '' });

      // Assert
      expect(searchParams.sort).toBeNull();
    });

    it('should accept valid string sort value', () => {
      // Arrange & Act
      const searchParams = new SearchParams({ sort: 'name' });

      // Assert
      expect(searchParams.sort).toBe('name');
    });

    it('should convert number to string', () => {
      // Arrange & Act
      const searchParams = new SearchParams({ sort: 123 as any });

      // Assert
      expect(searchParams.sort).toBe('123');
    });
  });

  describe('[sort_dir]', () => {
    it('should set sort_dir to null when sort is null', () => {
      // Arrange & Act
      const searchParams = new SearchParams({ sort: null, sort_dir: 'asc' });

      // Assert
      expect(searchParams.sort_dir).toBeNull();
    });

    it('should set sort_dir to null when sort is undefined', () => {
      // Arrange & Act
      const searchParams = new SearchParams({
        sort: undefined as any,
        sort_dir: 'desc',
      });

      // Assert
      expect(searchParams.sort_dir).toBeNull();
    });

    it('should set sort_dir to null when sort is empty string', () => {
      // Arrange & Act
      const searchParams = new SearchParams({ sort: '', sort_dir: 'asc' });

      // Assert
      expect(searchParams.sort_dir).toBeNull();
    });

    it('should set sort_dir to "asc" when value is "asc"', () => {
      // Arrange & Act
      const searchParams = new SearchParams({
        sort: 'name',
        sort_dir: 'asc',
      });

      // Assert
      expect(searchParams.sort_dir).toBe('asc');
    });

    it('should set sort_dir to "desc" when value is "desc"', () => {
      // Arrange & Act
      const searchParams = new SearchParams({
        sort: 'name',
        sort_dir: 'desc',
      });

      // Assert
      expect(searchParams.sort_dir).toBe('desc');
    });

    it('should set sort_dir to "asc" when value is invalid', () => {
      // Arrange & Act
      const searchParams = new SearchParams({
        sort: 'name',
        sort_dir: 'invalid' as any,
      });

      // Assert
      expect(searchParams.sort_dir).toBe('asc');
    });

    it('should set sort_dir to "asc" when value is null and sort exists', () => {
      // Arrange & Act
      const searchParams = new SearchParams({
        sort: 'name',
        sort_dir: null,
      });

      // Assert
      expect(searchParams.sort_dir).toBe('asc');
    });

    it('should convert uppercase to lowercase', () => {
      // Arrange & Act
      const searchParams = new SearchParams({
        sort: 'name',
        sort_dir: 'DESC' as any,
      });

      // Assert
      expect(searchParams.sort_dir).toBe('desc');
    });

    it('should set sort_dir to "asc" as default when sort exists and sort_dir is undefined', () => {
      // Arrange & Act
      const searchParams = new SearchParams({
        sort: 'name',
        sort_dir: undefined as any,
      });

      // Assert
      expect(searchParams.sort_dir).toBe('asc');
    });
  });

  describe('[filter]', () => {
    it('should set filter to null when value is null', () => {
      // Arrange & Act
      const searchParams = new SearchParams({ filter: null });

      // Assert
      expect(searchParams.filter).toBeNull();
    });

    it('should set filter to null when value is undefined', () => {
      // Arrange & Act
      const searchParams = new SearchParams({ filter: undefined as any });

      // Assert
      expect(searchParams.filter).toBeNull();
    });

    it('should set filter to null when value is empty string', () => {
      // Arrange & Act
      const searchParams = new SearchParams({ filter: '' as any });

      // Assert
      expect(searchParams.filter).toBeNull();
    });

    it('should accept valid filter value', () => {
      // Arrange & Act
      const searchParams = new SearchParams({ filter: 'test filter' });

      // Assert
      expect(searchParams.filter).toBe('test filter');
    });

    it('should accept custom filter type', () => {
      // Arrange
      type CustomFilter = { name: string; status: string };
      const customFilter: CustomFilter = { name: 'test', status: 'active' };

      // Act
      const searchParams = new SearchParams<CustomFilter>({
        filter: customFilter,
      });

      // Assert
      expect(searchParams.filter).toEqual(customFilter);
    });
  });

  describe('[equals]', () => {
    it('should return true when comparing two SearchParams with same values', () => {
      // Arrange
      const props = {
        page: 2,
        per_page: 20,
        sort: 'name',
        sort_dir: 'asc' as SortDirection,
        filter: 'test',
      };
      const searchParams1 = new SearchParams(props);
      const searchParams2 = new SearchParams(props);

      // Act
      const result = searchParams1.equals(searchParams2);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when comparing two SearchParams with different values', () => {
      // Arrange
      const searchParams1 = new SearchParams({ page: 1, per_page: 15 });
      const searchParams2 = new SearchParams({ page: 2, per_page: 20 });

      // Act
      const result = searchParams1.equals(searchParams2);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when comparing with null', () => {
      // Arrange
      const searchParams = new SearchParams();

      // Act
      const result = searchParams.equals(null as any);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when comparing with undefined', () => {
      // Arrange
      const searchParams = new SearchParams();

      // Act
      const result = searchParams.equals(undefined as any);

      // Assert
      expect(result).toBe(false);
    });

    it('should return true when comparing SearchParams with itself', () => {
      // Arrange
      const searchParams = new SearchParams({ page: 3, sort: 'name' });

      // Act
      const result = searchParams.equals(searchParams);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('[integrated behaviors]', () => {
    it('should handle complex SearchParams creation with all properties', () => {
      // Arrange
      const props = {
        page: 5,
        per_page: 50,
        sort: 'created_at',
        sort_dir: 'desc' as SortDirection,
        filter: 'active',
      };

      // Act
      const searchParams = new SearchParams(props);

      // Assert
      expect(searchParams.page).toBe(5);
      expect(searchParams.per_page).toBe(50);
      expect(searchParams.sort).toBe('created_at');
      expect(searchParams.sort_dir).toBe('desc');
      expect(searchParams.filter).toBe('active');
    });

    it('should normalize invalid values to defaults', () => {
      // Arrange & Act
      const searchParams = new SearchParams({
        page: -1,
        per_page: 0,
        sort: '',
        sort_dir: 'invalid' as any,
        filter: '',
      });

      // Assert
      expect(searchParams.page).toBe(1);
      expect(searchParams.per_page).toBe(15);
      expect(searchParams.sort).toBeNull();
      expect(searchParams.sort_dir).toBeNull();
      expect(searchParams.filter).toBeNull();
    });

    it('should maintain sort_dir when sort is provided and sort_dir is valid', () => {
      // Arrange & Act
      const searchParams = new SearchParams({
        sort: 'name',
        sort_dir: 'desc',
      });

      // Assert
      expect(searchParams.sort).toBe('name');
      expect(searchParams.sort_dir).toBe('desc');
    });
  });
});
