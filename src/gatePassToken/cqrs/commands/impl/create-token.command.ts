import { CreateTokenDto } from '../../../dto/create-token.dto';

export class CreateTokenCommand {
  constructor(
    public readonly createTokenDto: CreateTokenDto,
    public readonly userId: string,
  ) {}
}
