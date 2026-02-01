import { UserRole } from '../../users/entities/user.entity';
export interface JwtPayload {
    sub: string;
    email: string;
    roles: UserRole;
    estate?: string;
    iat?: number;
    exp?: number;
}
