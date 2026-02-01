import { UserRole } from '../../users/entities/user.entity';

export interface JwtPayload {
  sub: string; // User ID
  email: string; // User email
  roles: UserRole; // User roles
  estate?: string; // Estate ID if user is associated with an estate
  type: 'auth' | 'pre-auth' | 'password_reset'; // Distinction between full auth, pre-verification, and reset
  isVerified: boolean; // Verification status at time of issuance
  reason?: 'unverified_email' | 'active_on_another_device'; // Reason for pre-auth status
  version: number; // Token version for invalidation
  iat?: number; // Issued at timestamp
  exp?: number; // Expiration timestamp
}
