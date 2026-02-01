export class RemoveFcmTokenCommand {
  constructor(
    public readonly userId: string,
    public readonly fcmToken: string,
  ) {}
}
