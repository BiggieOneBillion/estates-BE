import { UpdatePropertyDto } from '../../../dto/update-property.dto';

export class UpdatePropertyCommand {
  constructor(
    public readonly id: string,
    public readonly updatePropertyDto: UpdatePropertyDto,
  ) {}
}
