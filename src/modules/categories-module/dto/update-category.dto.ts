import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from '@modules/categories-module/dto/create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
