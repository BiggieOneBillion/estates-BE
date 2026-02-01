export class CreateTenantCommand {
  constructor(
    public readonly landlordId: string,
    public readonly tenantData: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      propertyUnit?: string;
      leaseStartDate?: Date;
      leaseEndDate?: Date;
    },
  ) {}
}
