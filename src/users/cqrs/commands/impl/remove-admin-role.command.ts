export class RemoveAdminRoleCommand {
  constructor(
    public readonly requesterId: string,
    public readonly adminId: string,
    public readonly reason?: string,
  ) {}
}
