export class FindAllTokensQuery {}

export class FindTokensByUserQuery {
  constructor(public readonly userId: string) {}
}

export class FindTokensByEstateQuery {
  constructor(public readonly estateId: string) {}
}

export class FindTokenByIdQuery {
  constructor(public readonly id: string) {}
}

export class FindTokenByStringQuery {
  constructor(public readonly tokenString: string) {}
}
