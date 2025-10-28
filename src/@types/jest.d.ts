/* eslint-disable @typescript-eslint/naming-convention */
import type { FieldsErrors } from '@/shared/domain/validators/validator-fields.interface';

declare global {
  namespace jest {
    interface Matchers<R = unknown> {
      containsErrorMessages(expected: FieldsErrors): R;
    }
  }
}
