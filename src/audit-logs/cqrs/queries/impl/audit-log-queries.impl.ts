export class FindAllAuditLogsQuery {
  constructor(
    public readonly query: any = {},
    public readonly options: { limit?: number; skip?: number; sort?: any } = {},
  ) {}
}

export class GetAuditLogStatsQuery {}

export class FindAuditLogsByResourceQuery {
  constructor(
    public readonly resource: string,
    public readonly resourceId?: string,
  ) {}
}

export class FindAuditLogsByUserQuery {
  constructor(public readonly userId: string) {}
}
