import { VerifyPreAuthRequestDto } from '../../../dto/request/verify-preauth.request.dto';
import { User } from 'src/users/entities/user.entity';

export class VerifyPreAuthCommand {
  constructor(
    public readonly dto: VerifyPreAuthRequestDto,
    public readonly user: any,
  ) {}
}
