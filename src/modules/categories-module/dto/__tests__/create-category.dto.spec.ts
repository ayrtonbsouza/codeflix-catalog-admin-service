import { CreateCategoryDto } from '@modules/categories-module/dto/create-category.dto';
import { CreateCategoryInput } from '@core/category/application/use-cases/create-category/create-category.input';

describe('Unit: [CreateCategoryDto]', () => {
  it('should be defined', () => {
    // Assert
    expect(CreateCategoryDto).toBeDefined();
  });

  it('should extend CreateCategoryInput', () => {
    // Arrange
    const dto = new CreateCategoryDto({
      name: 'Test Category',
    });

    // Assert
    expect(dto).toBeInstanceOf(CreateCategoryInput);
    expect(dto).toBeInstanceOf(CreateCategoryDto);
  });

  it('should inherit name property from CreateCategoryInput', () => {
    // Arrange
    const dto = new CreateCategoryDto({
      name: 'Movie',
    });

    // Assert
    expect(dto.name).toBe('Movie');
  });

  it('should inherit description property from CreateCategoryInput', () => {
    // Arrange
    const dto = new CreateCategoryDto({
      name: 'Movie',
      description: 'Movie description',
    });

    // Assert
    expect(dto.description).toBe('Movie description');
  });

  it('should inherit is_active property from CreateCategoryInput', () => {
    // Arrange
    const dto = new CreateCategoryDto({
      name: 'Movie',
      is_active: false,
    });

    // Assert
    expect(dto.is_active).toBe(false);
  });

  it('should set default is_active to true when not provided', () => {
    // Arrange
    const dto = new CreateCategoryDto({
      name: 'Movie',
    });

    // Assert
    expect(dto.is_active).toBe(true);
  });

  it('should set description to null when not provided', () => {
    // Arrange
    const dto = new CreateCategoryDto({
      name: 'Movie',
    });

    // Assert
    expect(dto.description).toBeNull();
  });
});
