import {
  CreateCategoryInput,
  CreateCategoryInputValidator,
  type CreateCategoryInputProps,
} from '../create-category.input';

describe('Unit: [CreateCategoryInput]', () => {
  describe('[constructor]', () => {
    it('should create an instance with all fields', () => {
      // Arrange
      const props: CreateCategoryInputProps = {
        name: 'Action',
        description: 'Action movies category',
        is_active: true,
      };

      // Act
      const input = new CreateCategoryInput(props);

      // Assert
      expect(input.name).toBe(props.name);
      expect(input.description).toBe(props.description);
      expect(input.is_active).toBe(props.is_active);
    });

    it('should create an instance with only required fields', () => {
      // Arrange
      const props: CreateCategoryInputProps = {
        name: 'Comedy',
      };

      // Act
      const input = new CreateCategoryInput(props);

      // Assert
      expect(input.name).toBe(props.name);
      expect(input.description).toBeNull();
      expect(input.is_active).toBe(true);
    });

    it('should set default values when optional fields are not provided', () => {
      // Arrange
      const props: CreateCategoryInputProps = {
        name: 'Drama',
      };

      // Act
      const input = new CreateCategoryInput(props);

      // Assert
      expect(input.name).toBe(props.name);
      expect(input.description).toBeNull();
      expect(input.is_active).toBe(true);
    });

    it('should handle null description', () => {
      // Arrange
      const props: CreateCategoryInputProps = {
        name: 'Horror',
        description: null,
      };

      // Act
      const input = new CreateCategoryInput(props);

      // Assert
      expect(input.name).toBe(props.name);
      expect(input.description).toBeNull();
      expect(input.is_active).toBe(true);
    });

    it('should handle undefined description and set to null', () => {
      // Arrange
      const props: CreateCategoryInputProps = {
        name: 'Thriller',
        description: undefined,
      };

      // Act
      const input = new CreateCategoryInput(props);

      // Assert
      expect(input.name).toBe(props.name);
      expect(input.description).toBeNull();
      expect(input.is_active).toBe(true);
    });

    it('should handle is_active as false', () => {
      // Arrange
      const props: CreateCategoryInputProps = {
        name: 'Sci-Fi',
        is_active: false,
      };

      // Act
      const input = new CreateCategoryInput(props);

      // Assert
      expect(input.name).toBe(props.name);
      expect(input.is_active).toBe(false);
    });

    it('should handle empty props object', () => {
      // Arrange
      const props = null as unknown as CreateCategoryInputProps;

      // Act
      const input = new CreateCategoryInput(props);

      // Assert
      expect(input.name).toBeUndefined();
    });
  });

  describe('[CreateCategoryInputValidator.validate]', () => {
    it('should return empty array when input is valid with all fields', () => {
      // Arrange
      const input = new CreateCategoryInput({
        name: 'Action',
        description: 'Action movies category',
        is_active: true,
      });

      // Act
      const errors = CreateCategoryInputValidator.validate(input);

      // Assert
      expect(errors).toEqual([]);
    });

    it('should return empty array when input is valid with only required fields', () => {
      // Arrange
      const input = new CreateCategoryInput({
        name: 'Comedy',
      });

      // Act
      const errors = CreateCategoryInputValidator.validate(input);

      // Assert
      expect(errors).toEqual([]);
    });

    it('should return empty array when description is null', () => {
      // Arrange
      const input = new CreateCategoryInput({
        name: 'Drama',
        description: null,
      });

      // Act
      const errors = CreateCategoryInputValidator.validate(input);

      // Assert
      expect(errors).toEqual([]);
    });

    it('should return errors when name is empty', () => {
      // Arrange
      const input = new CreateCategoryInput({
        name: '',
      });

      // Act
      const errors = CreateCategoryInputValidator.validate(input);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toBeDefined();
    });

    it('should return errors when name is not provided', () => {
      // Arrange
      const input = new CreateCategoryInput({
        name: undefined as unknown as string,
      });

      // Act
      const errors = CreateCategoryInputValidator.validate(input);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const nameError = errors.find((error) => error.property === 'name');
      expect(nameError).toBeDefined();
      expect(nameError?.constraints).toBeDefined();
    });

    it('should return errors when name is not a string', () => {
      // Arrange
      const input = new CreateCategoryInput({
        name: 123 as unknown as string,
      });

      // Act
      const errors = CreateCategoryInputValidator.validate(input);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const nameError = errors.find((error) => error.property === 'name');
      expect(nameError).toBeDefined();
      expect(nameError?.constraints).toBeDefined();
    });

    it('should return errors when description is not a string', () => {
      // Arrange
      const input = new CreateCategoryInput({
        name: 'Action',
        description: 123 as unknown as string,
      });

      // Act
      const errors = CreateCategoryInputValidator.validate(input);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const descriptionError = errors.find(
        (error) => error.property === 'description',
      );
      expect(descriptionError).toBeDefined();
      expect(descriptionError?.constraints).toBeDefined();
    });

    it('should return errors when is_active is not a boolean', () => {
      // Arrange
      const input = new CreateCategoryInput({
        name: 'Action',
        is_active: 'true' as unknown as boolean,
      });

      // Act
      const errors = CreateCategoryInputValidator.validate(input);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const isActiveError = errors.find(
        (error) => error.property === 'is_active',
      );
      expect(isActiveError).toBeDefined();
      expect(isActiveError?.constraints).toBeDefined();
    });

    it('should accept valid string description', () => {
      // Arrange
      const input = new CreateCategoryInput({
        name: 'Action',
        description: 'A valid description',
      });

      // Act
      const errors = CreateCategoryInputValidator.validate(input);

      // Assert
      expect(errors).toEqual([]);
    });

    it('should accept is_active as true', () => {
      // Arrange
      const input = new CreateCategoryInput({
        name: 'Action',
        is_active: true,
      });

      // Act
      const errors = CreateCategoryInputValidator.validate(input);

      // Assert
      expect(errors).toEqual([]);
    });

    it('should accept is_active as false', () => {
      // Arrange
      const input = new CreateCategoryInput({
        name: 'Action',
        is_active: false,
      });

      // Act
      const errors = CreateCategoryInputValidator.validate(input);

      // Assert
      expect(errors).toEqual([]);
    });
  });
});
