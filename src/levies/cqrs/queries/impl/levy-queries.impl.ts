export class FindAllLeviesQuery {
  constructor(public readonly estateId: string) {}
}

export class FindActiveLeviesQuery {
  constructor(public readonly estateId: string) {}
}

export class FindLevyByIdQuery {
  constructor(
    public readonly id: string,
    public readonly estateId: string,
  ) {}
}

export class GetEnforcedLeviesForUserQuery {
  constructor(
    public readonly userId: string,
    public readonly userRole: string,
    public readonly estateId: string,
  ) {}
}

export class GetActiveLeviesForUserQuery {
  constructor(
    public readonly userId: string,
    public readonly userRole: string,
    public readonly estateId: string,
  ) {}
}
