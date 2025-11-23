import { SearchCategoryDto } from '@modules/categories-module/dto/search-category.dto';
import type { ListCategoriesInput } from '@core/category/application/use-cases/list-category/list-categories.use-case';
import type { SortDirection } from '@core/shared/domain/repositories/search-params';

describe('Unit: [SearchCategoryDto]', () => {
  it('should be defined', () => {
    // Assert
    expect(SearchCategoryDto).toBeDefined();
  });

  it('should implement ListCategoriesInput interface', () => {
    // Arrange
    const dto = new SearchCategoryDto();

    // Assert
    expect(dto).toBeDefined();
    expect(dto).toBeInstanceOf(SearchCategoryDto);
  });

  it('should have optional page property', () => {
    // Arrange
    const dto = new SearchCategoryDto();
    dto.page = 1;

    // Assert
    expect(dto.page).toBe(1);
  });

  it('should have optional per_page property', () => {
    // Arrange
    const dto = new SearchCategoryDto();
    dto.per_page = 10;

    // Assert
    expect(dto.per_page).toBe(10);
  });

  it('should have optional sort property', () => {
    // Arrange
    const dto = new SearchCategoryDto();
    dto.sort = 'name';

    // Assert
    expect(dto.sort).toBe('name');
  });

  it('should have optional sort_dir property', () => {
    // Arrange
    const dto = new SearchCategoryDto();
    dto.sort_dir = 'asc';

    // Assert
    expect(dto.sort_dir).toBe('asc');
  });

  it('should accept valid SortDirection values', () => {
    // Arrange
    const dto = new SearchCategoryDto();
    const directions: SortDirection[] = ['asc', 'desc'];

    // Act & Assert
    directions.forEach((dir) => {
      dto.sort_dir = dir;
      expect(dto.sort_dir).toBe(dir);
    });
  });

  it('should have optional filter property', () => {
    // Arrange
    const dto = new SearchCategoryDto();
    dto.filter = 'test';

    // Assert
    expect(dto.filter).toBe('test');
  });

  it('should allow all properties to be undefined', () => {
    // Arrange
    const dto = new SearchCategoryDto();

    // Assert
    expect(dto.page).toBeUndefined();
    expect(dto.per_page).toBeUndefined();
    expect(dto.sort).toBeUndefined();
    expect(dto.sort_dir).toBeUndefined();
    expect(dto.filter).toBeUndefined();
  });

  it('should allow setting all properties together', () => {
    // Arrange
    const dto = new SearchCategoryDto();
    dto.page = 2;
    dto.per_page = 20;
    dto.sort = 'created_at';
    dto.sort_dir = 'desc';
    dto.filter = 'category';

    // Assert
    expect(dto.page).toBe(2);
    expect(dto.per_page).toBe(20);
    expect(dto.sort).toBe('created_at');
    expect(dto.sort_dir).toBe('desc');
    expect(dto.filter).toBe('category');
  });
});


