import { VerifyLoginRequestDto } from '../../../dto/request/verify-login.request.dto';

export class VerifyLoginCommand {
  constructor(public readonly dto: VerifyLoginRequestDto) {}
}
