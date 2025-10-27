import { ValueObject } from "@/shared/domain/value-object";
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

export class Uuid extends ValueObject {
  readonly value: string;
  constructor(value?: string) {
    super();
    this.value = value || uuidv4();
    this.validate();
  }

  private validate() {
    const isValid = uuidValidate(this.value);
    if(!isValid) {
      throw new InvalidUuidError();
    }
  }
}

export class InvalidUuidError extends Error {
  constructor(message?: string) {
    super(message || 'value must be a valid UUID');
    this.name = 'InvalidUuidError';
  }
}
