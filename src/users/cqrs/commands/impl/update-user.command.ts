import { UpdateUserRequestDto } from '../../../dto/request/update-user.request.dto';
import { UpdateProfileRequestDto } from '../../../dto/request/update-profile.request.dto';

export class UpdateUserCommand {
  constructor(
    public readonly userId: string,
    public readonly updateData: UpdateUserRequestDto | UpdateProfileRequestDto,
  ) {}
}
