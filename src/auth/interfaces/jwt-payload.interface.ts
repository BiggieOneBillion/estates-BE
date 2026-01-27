import { UserRole } from '../../users/entities/user.entity';

export interface JwtPayload {
  sub: string; // User ID
  email: string; // User email
  roles: UserRole; // User roles
  estate?: string; // Estate ID if user is associated with an estate
  type: 'auth' | 'pre-auth'; // Distinction between full auth and pre-verification
  isVerified: boolean; // Verification status at time of issuance
  iat?: number; // Issued at timestamp
  exp?: number; // Expiration timestamp
}
