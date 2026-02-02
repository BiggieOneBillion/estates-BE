export class UpdateNotificationPreferencesCommand {
  constructor(
    public readonly userId: string,
    public readonly preferences: { email?: boolean; push?: boolean; sms?: boolean },
  ) {}
}
