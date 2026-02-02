import { CreateEstateDto } from '../../../dto/create-estate.dto';

export class CreateEstateCommand {
  constructor(
    public readonly createEstateDto: CreateEstateDto,
    public readonly userId: string,
  ) {}
}
