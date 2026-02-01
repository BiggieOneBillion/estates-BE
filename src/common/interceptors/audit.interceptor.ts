import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogsService } from 'src/audit-logs/audit-logs.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private readonly auditLogsService: AuditLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user, ip } = request;
    const userAgent = request.get('user-agent');

    // Only audit mutations (POST, PUT, DELETE, PATCH)
    const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
    
    // Skip auditing the login/register paths to avoid logging passwords (or handle them carefully)
    const isSensitive = url.includes('auth/login') || url.includes('auth/register');

    return next.handle().pipe(
      tap({
        next: (data) => {
          if (isMutation && !isSensitive) {
            this.logAction(request, context, data, null);
          }
        },
        error: (error) => {
          if (isMutation && !isSensitive) {
            this.logAction(request, context, null, error);
          }
        },
      }),
    );
  }

  private async logAction(request: any, context: ExecutionContext, responseData: any, error: any) {
    const { method, url, body, user, ip } = request;
    const userAgent = request.get('user-agent');
    const className = context.getClass().name;
    const handlerName = context.getHandler().name;

    try {
      await this.auditLogsService.create({
        userId: user?.id || user?._id || 'anonymous',
        action: `${method} ${url}`,
        resource: className.replace('Controller', ''),
        resourceId: body?.id || body?._id || request.params?.id || request.params?.shortId,
        payload: this.sanitizeBody(body),
        metadata: {
          ipAddress: ip,
          userAgent,
          path: url,
          method,
          statusCode: error ? error.status || 500 : 200,
          estateId: user?.estateId || body?.estateId,
        },
        timestamp: new Date(),
      });
    } catch (err) {
      this.logger.error(`Error in AuditInterceptor logAction: ${err.message}`);
    }
  }

  private sanitizeBody(body: any) {
    if (!body) return body;
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'oldPassword', 'newPassword'];
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '********';
      }
    });
    
    return sanitized;
  }
}
