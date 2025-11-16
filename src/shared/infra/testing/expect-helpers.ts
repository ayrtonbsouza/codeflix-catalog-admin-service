import type { Notification } from '@/shared/domain/validators/notification';
import type { ValueObject } from '@/shared/domain/entities/value-object';

expect.extend({
  notificationContainsErrorMessages(
    received: Notification,
    expected: Array<string | { [key: string]: string[] }>,
  ) {
    const every = expected.every((error) => {
      if (typeof error === 'string') {
        return received.errors.has(error);
      } else {
        return Object.entries(error).every(([field, messages]) => {
          const fieldMessages = received.errors.get(field) as string[];

          return (
            fieldMessages &&
            fieldMessages.length &&
            fieldMessages.every((message) => messages.includes(message))
          );
        });
      }
    });
    return every
      ? { pass: true, message: () => '' }
      : {
          pass: false,
          message: () =>
            `The validation errors not contains ${JSON.stringify(
              expected,
            )}. Current: ${JSON.stringify(received.toJSON())}`,
        };
  },
  toBeValueObject(expected: ValueObject, received: ValueObject) {
    return expected.equals(received)
      ? { pass: true, message: () => '' }
      : {
          pass: false,
          message: () =>
            `The values object are not equal. Expected: ${JSON.stringify(
              expected,
            )} | Received: ${JSON.stringify(received)}`,
        };
  },
});
