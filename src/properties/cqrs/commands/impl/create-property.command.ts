import { CreatePropertyDto } from '../../../dto/create-property.dto';

export class CreatePropertyCommand {
  constructor(public readonly createPropertyDto: CreatePropertyDto) {}
}
