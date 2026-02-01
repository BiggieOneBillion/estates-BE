import { CreateAdminDetailsDto } from '../../../dto/request/create-admin.request.dto';

export class PromoteLandlordToAdminCommand {
  constructor(
    public readonly requesterId: string,
    public readonly landlordId: string,
    public readonly adminDetails: CreateAdminDetailsDto,
    public readonly reason?: string,
  ) {}
}
