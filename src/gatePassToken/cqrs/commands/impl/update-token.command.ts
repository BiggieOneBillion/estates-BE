import { UpdateTokenDto } from '../../../dto/update-token.dto';

export class UpdateTokenCommand {
  constructor(
    public readonly id: string,
    public readonly updateTokenDto: UpdateTokenDto,
    public readonly userId: string,
    public readonly isImage?: boolean,
  ) {}
}
