import { CreateLevyDto } from '../../../dto/create-levy.dto';
import { UpdateLevyDto } from '../../../dto/update-levy.dto';

export class CreateLevyCommand {
  constructor(
    public readonly createLevyDto: CreateLevyDto,
    public readonly userId: string,
    public readonly estateId: string,
  ) {}
}

export class UpdateLevyCommand {
  constructor(
    public readonly id: string,
    public readonly updateLevyDto: UpdateLevyDto,
    public readonly estateId: string,
  ) {}
}

export class DeleteLevyCommand {
  constructor(
    public readonly id: string,
    public readonly estateId: string,
  ) {}
}
