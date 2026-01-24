export enum DomainEvents {
  TOKEN_CREATED = 'token.created',
  TOKEN_VERIFIED = 'token.verified',
  VISITOR_VERIFIED = 'visitor.verified',
  VISITOR_REJECTED = 'visitor.rejected',
  TOKEN_UPDATED = 'token.updated',
}

export class TokenEvent {
  constructor(
    public readonly userId: string,
    public readonly tokenId: string,
    public readonly tokenValue: string,
    public readonly payload?: any,
  ) {}
}
