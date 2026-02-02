import { LoginRequestDto } from '../../../dto/request/login.request.dto';

export class LoginCommand {
  constructor(
    public readonly loginDto: LoginRequestDto,
    public readonly isMobile: boolean,
  ) {}
}
