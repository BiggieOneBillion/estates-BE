export class CreateSecurityCommand {
  constructor(
    public readonly requesterId: string,
    public readonly securityData: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    },
  ) {}
}
