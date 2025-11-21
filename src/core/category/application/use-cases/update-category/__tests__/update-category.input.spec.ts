import {
  UpdateCategoryInput,
  UpdateCategoryInputValidator,
  type UpdateCategoryInputProps,
} from '@core/category/application/use-cases/update-category/update-category.input';

describe('Unit: [UpdateCategoryInput]', () => {
  describe('[constructor]', () => {
    it('should create an instance with all fields', () => {
      // Arrange
      const props: UpdateCategoryInputProps = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Updated Name',
        description: 'Updated description',
        is_active: true,
      };

      // Act
      const input = new UpdateCategoryInput(props);

      // Assert
      expect(input.id).toBe(props.id);
      expect(input.name).toBe(props.name);
      expect(input.description).toBe(props.description);
      expect(input.is_active).toBe(props.is_active);
    });

    it('should create an instance with only id', () => {
      // Arrange
      const props: UpdateCategoryInputProps = {
        id: '123e4567-e89b-12d3-a456-426614174000',
      };

      // Act
      const input = new UpdateCategoryInput(props);

      // Assert
      expect(input.id).toBe(props.id);
      expect(input.name).toBeUndefined();
      expect(input.description).toBeUndefined();
      expect(input.is_active).toBeUndefined();
    });

    it('should create an instance with id and name only', () => {
      // Arrange
      const props: UpdateCategoryInputProps = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'New Name',
      };

      // Act
      const input = new UpdateCategoryInput(props);

      // Assert
      expect(input.id).toBe(props.id);
      expect(input.name).toBe(props.name);
      expect(input.description).toBeUndefined();
      expect(input.is_active).toBeUndefined();
    });

    it('should create an instance with id and description only', () => {
      // Arrange
      const props: UpdateCategoryInputProps = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        description: 'New Description',
      };

      // Act
      const input = new UpdateCategoryInput(props);

      // Assert
      expect(input.id).toBe(props.id);
      expect(input.name).toBeUndefined();
      expect(input.description).toBe(props.description);
      expect(input.is_active).toBeUndefined();
    });

    it('should create an instance with id and is_active only', () => {
      // Arrange
      const props: UpdateCategoryInputProps = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        is_active: true,
      };

      // Act
      const input = new UpdateCategoryInput(props);

      // Assert
      expect(input.id).toBe(props.id);
      expect(input.name).toBeUndefined();
      expect(input.description).toBeUndefined();
      expect(input.is_active).toBe(true);
    });

    it('should handle null description', () => {
      // Arrange
      const props: UpdateCategoryInputProps = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        description: null,
      };

      // Act
      const input = new UpdateCategoryInput(props);

      // Assert
      expect(input.id).toBe(props.id);
      expect(input.description).toBeNull();
    });

    it('should not set name when it is undefined', () => {
      // Arrange
      const props: UpdateCategoryInputProps = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: undefined,
      };

      // Act
      const input = new UpdateCategoryInput(props);

      // Assert
      expect(input.id).toBe(props.id);
      expect(input.name).toBeUndefined();
    });

    it('should not set description when it is undefined', () => {
      // Arrange
      const props: UpdateCategoryInputProps = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        description: undefined,
      };

      // Act
      const input = new UpdateCategoryInput(props);

      // Assert
      expect(input.id).toBe(props.id);
      expect(input.description).toBeUndefined();
    });

    it('should not set is_active when it is undefined', () => {
      // Arrange
      const props: UpdateCategoryInputProps = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        is_active: undefined,
      };

      // Act
      const input = new UpdateCategoryInput(props);

      // Assert
      expect(input.id).toBe(props.id);
      expect(input.is_active).toBeUndefined();
    });

    it('should not set is_active when it is null', () => {
      // Arrange
      const props: UpdateCategoryInputProps = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        is_active: null as unknown as boolean,
      };

      // Act
      const input = new UpdateCategoryInput(props);

      // Assert
      expect(input.id).toBe(props.id);
      expect(input.is_active).toBeUndefined();
    });

    it('should handle is_active as false', () => {
      // Arrange
      const props: UpdateCategoryInputProps = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        is_active: false,
      };

      // Act
      const input = new UpdateCategoryInput(props);

      // Assert
      expect(input.id).toBe(props.id);
      expect(input.is_active).toBe(false);
    });

    it('should handle empty props object', () => {
      // Arrange
      const props = null as unknown as UpdateCategoryInputProps;

      // Act
      const input = new UpdateCategoryInput(props);

      // Assert
      expect(input.id).toBeUndefined();
    });
  });

  describe('[UpdateCategoryInputValidator.validate]', () => {
    it('should return empty array when input is valid with all fields', () => {
      // Arrange
      const input = new UpdateCategoryInput({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Updated Name',
        description: 'Updated description',
        is_active: true,
      });

      // Act
      const errors = UpdateCategoryInputValidator.validate(input);

      // Assert
      expect(errors).toEqual([]);
    });

    it('should return empty array when input is valid with only id', () => {
      // Arrange
      const input = new UpdateCategoryInput({
        id: '123e4567-e89b-12d3-a456-426614174000',
      });

      // Act
      const errors = UpdateCategoryInputValidator.validate(input);

      // Assert
      expect(errors).toEqual([]);
    });

    it('should return empty array when only id and name are provided', () => {
      // Arrange
      const input = new UpdateCategoryInput({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'New Name',
      });

      // Act
      const errors = UpdateCategoryInputValidator.validate(input);

      // Assert
      expect(errors).toEqual([]);
    });

    it('should return empty array when description is null', () => {
      // Arrange
      const input = new UpdateCategoryInput({
        id: '123e4567-e89b-12d3-a456-426614174000',
        description: null,
      });

      // Act
      const errors = UpdateCategoryInputValidator.validate(input);

      // Assert
      expect(errors).toEqual([]);
    });

    it('should return empty array when optional fields are undefined', () => {
      // Arrange
      const input = new UpdateCategoryInput({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: undefined,
        description: undefined,
        is_active: undefined,
      });

      // Act
      const errors = UpdateCategoryInputValidator.validate(input);

      // Assert
      expect(errors).toEqual([]);
    });

    it('should return errors when id is empty', () => {
      // Arrange
      const input = new UpdateCategoryInput({
        id: '',
      });

      // Act
      const errors = UpdateCategoryInputValidator.validate(input);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const idError = errors.find((error) => error.property === 'id');
      expect(idError).toBeDefined();
      expect(idError?.constraints).toBeDefined();
    });

    it('should skip validation when id is undefined due to skipMissingProperties', () => {
      // Arrange
      const input = new UpdateCategoryInput({
        id: undefined as unknown as string,
      });

      // Act
      const errors = UpdateCategoryInputValidator.validate(input);

      // Assert
      // Note: With skipMissingProperties: true, undefined properties are skipped
      // This is expected behavior for update operations where optional fields may be undefined
      // The id validation should be handled at the use case level
      expect(errors).toEqual([]);
    });

    it('should return errors when id is not a string', () => {
      // Arrange
      const input = new UpdateCategoryInput({
        id: 123 as unknown as string,
      });

      // Act
      const errors = UpdateCategoryInputValidator.validate(input);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const idError = errors.find((error) => error.property === 'id');
      expect(idError).toBeDefined();
      expect(idError?.constraints).toBeDefined();
    });

    it('should return errors when name is not a string', () => {
      // Arrange
      const input = new UpdateCategoryInput({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 123 as unknown as string,
      });

      // Act
      const errors = UpdateCategoryInputValidator.validate(input);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const nameError = errors.find((error) => error.property === 'name');
      expect(nameError).toBeDefined();
      expect(nameError?.constraints).toBeDefined();
    });

    it('should return errors when description is not a string', () => {
      // Arrange
      const input = new UpdateCategoryInput({
        id: '123e4567-e89b-12d3-a456-426614174000',
        description: 123 as unknown as string,
      });

      // Act
      const errors = UpdateCategoryInputValidator.validate(input);

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
      const input = new UpdateCategoryInput({
        id: '123e4567-e89b-12d3-a456-426614174000',
        is_active: 'true' as unknown as boolean,
      });

      // Act
      const errors = UpdateCategoryInputValidator.validate(input);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      const isActiveError = errors.find(
        (error) => error.property === 'is_active',
      );
      expect(isActiveError).toBeDefined();
      expect(isActiveError?.constraints).toBeDefined();
    });

    it('should accept valid string name', () => {
      // Arrange
      const input = new UpdateCategoryInput({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Valid Name',
      });

      // Act
      const errors = UpdateCategoryInputValidator.validate(input);

      // Assert
      expect(errors).toEqual([]);
    });

    it('should accept valid string description', () => {
      // Arrange
      const input = new UpdateCategoryInput({
        id: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Valid description',
      });

      // Act
      const errors = UpdateCategoryInputValidator.validate(input);

      // Assert
      expect(errors).toEqual([]);
    });

    it('should accept is_active as true', () => {
      // Arrange
      const input = new UpdateCategoryInput({
        id: '123e4567-e89b-12d3-a456-426614174000',
        is_active: true,
      });

      // Act
      const errors = UpdateCategoryInputValidator.validate(input);

      // Assert
      expect(errors).toEqual([]);
    });

    it('should accept is_active as false', () => {
      // Arrange
      const input = new UpdateCategoryInput({
        id: '123e4567-e89b-12d3-a456-426614174000',
        is_active: false,
      });

      // Act
      const errors = UpdateCategoryInputValidator.validate(input);

      // Assert
      expect(errors).toEqual([]);
    });
  });
});
