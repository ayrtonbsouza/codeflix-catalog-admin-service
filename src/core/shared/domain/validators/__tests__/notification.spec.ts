import { Notification } from '@core/shared/domain/validators/notification';

describe('Unit: [Notification]', () => {
  let notification: Notification;

  beforeEach(() => {
    notification = new Notification();
  });

  describe('[addError]', () => {
    it('should add an error without field', () => {
      // Arrange
      const error = 'Error message';

      // Act
      notification.addError(error);

      // Assert
      expect(notification.hasErrors()).toBe(true);
      expect(notification.errors.get(error)).toBe(error);
    });

    it('should add an error with field', () => {
      // Arrange
      const error = 'Error message';
      const field = 'name';

      // Act
      notification.addError(error, field);

      // Assert
      expect(notification.hasErrors()).toBe(true);
      const errors = notification.errors.get(field) as string[];
      expect(Array.isArray(errors)).toBe(true);
      expect(errors).toContain(error);
      expect(errors.length).toBe(1);
    });

    it('should add multiple errors to the same field', () => {
      // Arrange
      const error1 = 'Error message 1';
      const error2 = 'Error message 2';
      const field = 'name';

      // Act
      notification.addError(error1, field);
      notification.addError(error2, field);

      // Assert
      expect(notification.hasErrors()).toBe(true);
      const errors = notification.errors.get(field) as string[];
      expect(errors).toContain(error1);
      expect(errors).toContain(error2);
      expect(errors.length).toBe(2);
    });

    it('should not add duplicate errors to the same field', () => {
      // Arrange
      const error = 'Error message';
      const field = 'name';

      // Act
      notification.addError(error, field);
      notification.addError(error, field);

      // Assert
      expect(notification.hasErrors()).toBe(true);
      const errors = notification.errors.get(field) as string[];
      expect(errors).toContain(error);
      expect(errors.length).toBe(1);
    });

    it('should add errors to different fields independently', () => {
      // Arrange
      const error1 = 'Error 1';
      const error2 = 'Error 2';
      const field1 = 'name';
      const field2 = 'email';

      // Act
      notification.addError(error1, field1);
      notification.addError(error2, field2);

      // Assert
      expect(notification.hasErrors()).toBe(true);
      const errors1 = notification.errors.get(field1) as string[];
      const errors2 = notification.errors.get(field2) as string[];
      expect(errors1).toContain(error1);
      expect(errors2).toContain(error2);
      expect(errors1.length).toBe(1);
      expect(errors2.length).toBe(1);
    });
  });

  describe('[setError]', () => {
    it('should set a single error without field', () => {
      // Arrange
      const error = 'Error message';

      // Act
      notification.setError(error);

      // Assert
      expect(notification.hasErrors()).toBe(true);
      expect(notification.errors.get(error)).toBe(error);
    });

    it('should set a single error with field', () => {
      // Arrange
      const error = 'Error message';
      const field = 'name';

      // Act
      notification.setError(error, field);

      // Assert
      expect(notification.hasErrors()).toBe(true);
      const errors = notification.errors.get(field) as string[];
      expect(Array.isArray(errors)).toBe(true);
      expect(errors).toContain(error);
      expect(errors.length).toBe(1);
    });

    it('should set an array of errors with field', () => {
      // Arrange
      const errors = ['Error 1', 'Error 2', 'Error 3'];
      const field = 'name';

      // Act
      notification.setError(errors, field);

      // Assert
      expect(notification.hasErrors()).toBe(true);
      const fieldErrors = notification.errors.get(field) as string[];
      expect(Array.isArray(fieldErrors)).toBe(true);
      expect(fieldErrors).toEqual(errors);
      expect(fieldErrors.length).toBe(3);
    });

    it('should set an array of errors without field', () => {
      // Arrange
      const errors = ['Error 1', 'Error 2', 'Error 3'];

      // Act
      notification.setError(errors);

      // Assert
      expect(notification.hasErrors()).toBe(true);
      errors.forEach((error) => {
        expect(notification.errors.get(error)).toBe(error);
      });
    });

    it('should replace existing errors when setting new ones on the same field', () => {
      // Arrange
      const field = 'name';
      notification.addError('Old error', field);

      // Act
      notification.setError('New error', field);

      // Assert
      const errors = notification.errors.get(field) as string[];
      expect(errors).toContain('New error');
      expect(errors).not.toContain('Old error');
      expect(errors.length).toBe(1);
    });

    it('should replace existing errors when setting array of errors', () => {
      // Arrange
      const field = 'name';
      notification.addError('Old error 1', field);
      notification.addError('Old error 2', field);

      // Act
      notification.setError(['New error 1', 'New error 2'], field);

      // Assert
      const errors = notification.errors.get(field) as string[];
      expect(errors).toEqual(['New error 1', 'New error 2']);
      expect(errors.length).toBe(2);
    });
  });

  describe('[hasErrors]', () => {
    it('should return false when there are no errors', () => {
      // Act & Assert
      expect(notification.hasErrors()).toBe(false);
    });

    it('should return true when there is at least one error without field', () => {
      // Arrange
      notification.addError('Error message');

      // Act & Assert
      expect(notification.hasErrors()).toBe(true);
    });

    it('should return true when there is at least one error with field', () => {
      // Arrange
      notification.addError('Error message', 'name');

      // Act & Assert
      expect(notification.hasErrors()).toBe(true);
    });

    it('should return true when there are multiple errors', () => {
      // Arrange
      notification.addError('Error 1', 'name');
      notification.addError('Error 2', 'email');

      // Act & Assert
      expect(notification.hasErrors()).toBe(true);
    });
  });

  describe('[copyErrors]', () => {
    it('should copy errors from another notification without fields', () => {
      // Arrange
      const sourceNotification = new Notification();
      sourceNotification.addError('Error 1');
      sourceNotification.addError('Error 2');

      // Act
      notification.copyErrors(sourceNotification);

      // Assert
      expect(notification.hasErrors()).toBe(true);
      const error1 = notification.errors.get('Error 1') as string[];
      const error2 = notification.errors.get('Error 2') as string[];
      expect(Array.isArray(error1)).toBe(true);
      expect(Array.isArray(error2)).toBe(true);
      expect(error1).toContain('Error 1');
      expect(error2).toContain('Error 2');
    });

    it('should copy errors from another notification with fields', () => {
      // Arrange
      const sourceNotification = new Notification();
      sourceNotification.addError('Error 1', 'name');
      sourceNotification.addError('Error 2', 'email');

      // Act
      notification.copyErrors(sourceNotification);

      // Assert
      expect(notification.hasErrors()).toBe(true);
      const nameErrors = notification.errors.get('name') as string[];
      const emailErrors = notification.errors.get('email') as string[];
      expect(nameErrors).toContain('Error 1');
      expect(emailErrors).toContain('Error 2');
    });

    it('should copy mixed errors (with and without fields)', () => {
      // Arrange
      const sourceNotification = new Notification();
      sourceNotification.addError('Global error');
      sourceNotification.addError('Field error', 'name');

      // Act
      notification.copyErrors(sourceNotification);

      // Assert
      expect(notification.hasErrors()).toBe(true);
      const globalError = notification.errors.get('Global error') as string[];
      expect(Array.isArray(globalError)).toBe(true);
      expect(globalError).toContain('Global error');
      const nameErrors = notification.errors.get('name') as string[];
      expect(nameErrors).toContain('Field error');
    });

    it('should merge errors when copying to a notification that already has errors', () => {
      // Arrange
      notification.addError('Existing error', 'name');
      const sourceNotification = new Notification();
      sourceNotification.addError('New error', 'name');
      sourceNotification.addError('Another error', 'email');

      // Act
      notification.copyErrors(sourceNotification);

      // Assert
      expect(notification.hasErrors()).toBe(true);
      const nameErrors = notification.errors.get('name') as string[];
      const emailErrors = notification.errors.get('email') as string[];
      expect(nameErrors).toContain('New error');
      expect(nameErrors).not.toContain('Existing error');
      expect(emailErrors).toContain('Another error');
    });

    it('should handle copying from an empty notification', () => {
      // Arrange
      const sourceNotification = new Notification();
      notification.addError('Existing error');

      // Act
      notification.copyErrors(sourceNotification);

      // Assert
      expect(notification.hasErrors()).toBe(true);
      expect(notification.errors.get('Existing error')).toBe('Existing error');
    });
  });

  describe('[toJSON]', () => {
    it('should return empty array when there are no errors', () => {
      // Act
      const result = notification.toJSON();

      // Assert
      expect(result).toEqual([]);
    });

    it('should return array with string errors when errors have no field', () => {
      // Arrange
      notification.addError('Error 1');
      notification.addError('Error 2');

      // Act
      const result = notification.toJSON();

      // Assert
      expect(result).toHaveLength(2);
      expect(result).toContain('Error 1');
      expect(result).toContain('Error 2');
    });

    it('should return array with object errors when errors have field', () => {
      // Arrange
      notification.addError('Error 1', 'name');
      notification.addError('Error 2', 'email');

      // Act
      const result = notification.toJSON();

      // Assert
      expect(result).toHaveLength(2);
      expect(result).toContainEqual({ name: ['Error 1'] });
      expect(result).toContainEqual({ email: ['Error 2'] });
    });

    it('should return mixed array with strings and objects for mixed errors', () => {
      // Arrange
      notification.addError('Global error');
      notification.addError('Field error', 'name');

      // Act
      const result = notification.toJSON();

      // Assert
      expect(result).toHaveLength(2);
      expect(result).toContain('Global error');
      expect(result).toContainEqual({ name: ['Field error'] });
    });

    it('should return array with multiple errors for the same field', () => {
      // Arrange
      notification.addError('Error 1', 'name');
      notification.addError('Error 2', 'name');
      notification.addError('Error 3', 'name');

      // Act
      const result = notification.toJSON();

      // Assert
      expect(result).toHaveLength(1);
      expect(result).toContainEqual({
        name: ['Error 1', 'Error 2', 'Error 3'],
      });
    });

    it('should return correct format for complex error scenarios', () => {
      // Arrange
      notification.addError('Global error 1');
      notification.addError('Global error 2');
      notification.addError('Name error 1', 'name');
      notification.addError('Name error 2', 'name');
      notification.addError('Email error', 'email');

      // Act
      const result = notification.toJSON();

      // Assert
      expect(result).toHaveLength(4);
      expect(result).toContain('Global error 1');
      expect(result).toContain('Global error 2');
      expect(result).toContainEqual({
        name: ['Name error 1', 'Name error 2'],
      });
      expect(result).toContainEqual({ email: ['Email error'] });
    });
  });

  describe('[integration scenarios]', () => {
    it('should handle complete workflow: add, set, copy, and convert to JSON', () => {
      // Arrange
      const sourceNotification = new Notification();
      sourceNotification.addError('Source error', 'field1');

      // Act
      notification.addError('Initial error', 'name');
      notification.setError('Replaced error', 'name');
      notification.addError('Additional error', 'email');
      notification.copyErrors(sourceNotification);
      const json = notification.toJSON();

      // Assert
      expect(notification.hasErrors()).toBe(true);
      expect(json).toHaveLength(3);
      expect(json).toContainEqual({ name: ['Replaced error'] });
      expect(json).toContainEqual({ email: ['Additional error'] });
      expect(json).toContainEqual({ field1: ['Source error'] });
    });

    it('should handle clearing and re-adding errors', () => {
      // Arrange
      notification.addError('Error 1', 'name');
      notification.addError('Error 2', 'email');

      // Act
      const newNotification = new Notification();
      newNotification.addError('New error', 'name');

      // Assert
      expect(notification.hasErrors()).toBe(true);
      expect(newNotification.hasErrors()).toBe(true);
      expect(notification.errors.size).toBe(2);
      expect(newNotification.errors.size).toBe(1);
    });
  });
});
