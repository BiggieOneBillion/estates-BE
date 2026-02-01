import { RegisterRequestDto } from '../../../dto/request/register.request.dto';

export class RegisterCommand {
  constructor(public readonly registerDto: RegisterRequestDto) {}
}
