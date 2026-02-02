import { UpdateEstateDto } from '../../../dto/update-estate.dto';

export class UpdateEstateCommand {
  constructor(
    public readonly id: string,
    public readonly updateEstateDto: UpdateEstateDto,
  ) {}
}
