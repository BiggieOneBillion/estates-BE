export class VerifyResetOtpCommand {
  constructor(
    public readonly email: string,
    public readonly otp: string,
  ) {}
}
