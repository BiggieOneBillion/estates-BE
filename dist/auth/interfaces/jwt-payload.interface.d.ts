import { UserRole } from '../../users/entities/user.entity';
export interface JwtPayload {
    sub: string;
    email: string;
    roles: UserRole;
    estate?: string;
    type: 'auth' | 'pre-auth';
    isVerified: boolean;
    reason?: 'unverified_email' | 'active_on_another_device';
    version: number;
    iat?: number;
    exp?: number;
}
