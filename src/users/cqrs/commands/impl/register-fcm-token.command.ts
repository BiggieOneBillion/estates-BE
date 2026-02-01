export class RegisterFcmTokenCommand {
  constructor(
    public readonly userId: string,
    public readonly fcmToken: string,
  ) {}
}
