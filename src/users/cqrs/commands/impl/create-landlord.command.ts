export class CreateLandlordCommand {
  constructor(
    public readonly requesterId: string,
    public readonly landlordData: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      ownedProperties?: string[];
      canCreateTenants?: boolean;
    },
  ) {}
}
