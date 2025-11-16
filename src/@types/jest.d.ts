/* eslint-disable @typescript-eslint/naming-convention */

declare global {
  namespace jest {
    interface Matchers<R = unknown> {
      notificationContainsErrorMessages(
        expected: Array<string | { [key: string]: string[] }>,
      ): R;
    }
  }
}

export {};
