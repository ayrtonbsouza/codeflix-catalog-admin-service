import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidationError,
  validateSync,
} from 'class-validator';

export type CreateCategoryInputProps = {
  name: string;
  description?: string | null;
  is_active?: boolean;
};

export class CreateCategoryInput {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  constructor(props: CreateCategoryInputProps) {
    if (!props) return;
    this.name = props.name;
    this.description = props.description ?? null;
    this.is_active = props.is_active ?? true;
  }
}

export class CreateCategoryInputValidator {
  static validate(input: CreateCategoryInput): ValidationError[] {
    return validateSync(input);
  }
}
