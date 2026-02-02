export class VerifyTokenCommand {
  constructor(
    public readonly tokenString: string,
    public readonly securityUserId: string,
  ) {}
}
