import { CreateUserRequestDto } from '../../../dto/request/create-user.request.dto';

export class CreateUserCommand {
  constructor(
    public readonly requesterId: string,
    public readonly userData: CreateUserRequestDto,
  ) {}
}
