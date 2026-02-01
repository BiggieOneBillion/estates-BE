import { LoginHandler } from './cqrs/commands/handlers/login.handler';
import { RegisterHandler } from './cqrs/commands/handlers/register.handler';
import { VerifyPreAuthHandler } from './cqrs/commands/handlers/verify-preauth.handler';
import { VerifyEmailHandler } from './cqrs/commands/handlers/verify-email.handler';
import { ForgotPasswordHandler } from './cqrs/commands/handlers/forgot-password.handler';
import { VerifyResetOtpHandler } from './cqrs/commands/handlers/verify-reset-otp.handler';
import { ResetPasswordHandler } from './cqrs/commands/handlers/reset-password.handler';
import { LogoutHandler } from './cqrs/commands/handlers/logout.handler';
import { VerifyLoginHandler } from './cqrs/commands/handlers/verify-login.handler';
export declare const CommandHandlers: (typeof LoginHandler | typeof RegisterHandler | typeof VerifyPreAuthHandler | typeof VerifyEmailHandler | typeof ForgotPasswordHandler | typeof VerifyResetOtpHandler | typeof ResetPasswordHandler | typeof LogoutHandler | typeof VerifyLoginHandler)[];
export declare class AuthModule {
}
