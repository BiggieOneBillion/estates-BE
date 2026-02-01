import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/role.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { VerifiedGuard } from 'src/auth/guards/verified.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { FindAllAuditLogsQuery, GetAuditLogStatsQuery, FindAuditLogsByResourceQuery, FindAuditLogsByUserQuery } from './cqrs/queries/impl/audit-log-queries.impl';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, VerifiedGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.SITE_ADMIN)
export class AuditLogsController {
  constructor(
    private readonly auditLogsService: AuditLogsService,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async findAll(
    @Query('limit') limit?: number,
    @Query('skip') skip?: number,
    @Query('action') action?: string,
    @Query('resource') resource?: string,
    @Query('userId') userId?: string,
  ) {
    const filter: any = {};
    if (action) filter.action = action;
    if (resource) filter.resource = resource;
    if (userId) filter.userId = userId;

    return this.queryBus.execute(new FindAllAuditLogsQuery(filter, {
      limit: limit ? Number(limit) : 100,
      skip: skip ? Number(skip) : 0,
    }));
  }

  @Get('stats')
  async getStats() {
    return this.queryBus.execute(new GetAuditLogStatsQuery());
  }

  @Get('resource/:resource/:resourceId')
  async findByResource(
    @Param('resource') resource: string,
    @Param('resourceId') resourceId: string,
  ) {
    return this.queryBus.execute(new FindAuditLogsByResourceQuery(resource, resourceId));
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    return this.queryBus.execute(new FindAuditLogsByUserQuery(userId));
  }
}
