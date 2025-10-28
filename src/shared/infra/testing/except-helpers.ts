import type { ClassValidatorFields } from '@/shared/domain/validators/class-validator-fields';
import type { EntityValidationError } from '@/shared/domain/validators/validation.error';
import type { FieldsErrors } from '@/shared/domain/validators/validator-fields.interface';

type Expected =
  | {
      validator: ClassValidatorFields<any>;
      data: any;
    }
  | (() => any);

expect.extend({
  containsErrorMessages: (received: Expected, expected: FieldsErrors) => {
    if (typeof received === 'function') {
      try {
        received();
        return isValid();
      } catch (e) {
        const error = e as EntityValidationError;
        return assertContainsErrorMessages(expected, error.error);
      }
    } else {
      const { validator, data } = received;
      const validated = validator.validate(data);

      if (validated) {
        return isValid();
      }

      return assertContainsErrorMessages(expected, validator.errors);
    }
  },
});

function isValid() {
  return { pass: true, message: () => '' };
}

function assertContainsErrorMessages(
  expected: FieldsErrors,
  received: FieldsErrors,
) {
  const fields = Object.keys(expected);

  const errors: string[] = [];

  for (const field of fields) {
    const expectedMessages = expected[field];
    const receivedMessages = received[field];

    if (!receivedMessages) {
      errors.push(
        `Field ${field} does not have errors: expected ${JSON.stringify(expectedMessages)}`,
      );
      continue;
    }

    if (!Array.isArray(expectedMessages) || expectedMessages.length === 0) {
      continue;
    }

    for (const expectedMsg of expectedMessages) {
      const hasMessage = receivedMessages.some(
        (msg: string) => msg === expectedMsg,
      );

      if (!hasMessage) {
        errors.push(
          `Field ${field} does not contain error: "${expectedMsg}". Received: ${JSON.stringify(receivedMessages)}`,
        );
      }
    }
  }

  return errors.length === 0
    ? { pass: true, message: () => '' }
    : {
        pass: false,
        message: () =>
          `Validation errors:\n${errors.join('\n')}\n\nExpected (at least): ${JSON.stringify(expected)}\nReceived: ${JSON.stringify(received)}`,
      };
}
