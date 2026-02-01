export class CheckUserComplianceQuery {
  constructor(public readonly userId: string) {}
}

export class GetEstateComplianceReportQuery {
  constructor(public readonly estateId: string) {}
}

export class GetOutstandingLeviesQuery {
  constructor(public readonly userId: string) {}
}
