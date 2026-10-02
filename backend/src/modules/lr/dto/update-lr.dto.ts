import { PartialType } from '@nestjs/swagger';
import { CreateLrDto } from './create-lr.dto';

export class UpdateLrDto extends PartialType(CreateLrDto) {}
