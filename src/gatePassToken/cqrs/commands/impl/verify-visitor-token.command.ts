export class VerifyVisitorTokenCommand {
  constructor(
    public readonly tokenString: string,
    public readonly userId: string,
  ) {}
}
