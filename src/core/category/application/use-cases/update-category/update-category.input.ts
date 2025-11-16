import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidationError,
  validateSync,
} from 'class-validator';

export type UpdateCategoryInputProps = {
  id: string;
  name?: string;
  description?: string | null;
  is_active?: boolean;
};

export class UpdateCategoryInput {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  constructor(props?: UpdateCategoryInputProps) {
    if (!props) return;
    this.id = props.id;
    if (props.name !== undefined) {
      this.name = props.name;
    }
    if (props.description !== undefined) {
      this.description = props.description;
    }
    if (props.is_active !== undefined && props.is_active !== null) {
      this.is_active = props.is_active;
    }
  }
}

export class UpdateCategoryInputValidator {
  static validate(input: UpdateCategoryInput): ValidationError[] {
    return validateSync(input, { skipMissingProperties: true });
  }
}
