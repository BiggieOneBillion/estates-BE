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
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuditLogResponseDto, AuditLogStatsDto } from './dto/response/audit-log.response.dto';
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

  @ApiOperation({ summary: 'Find all audit logs' })
  @ApiResponse({ status: 200, type: [AuditLogResponseDto], description: 'Audit logs retrieved successfully' })
  @Get()
  async findAll(
    @Query('limit') limit?: number,
    @Query('skip') skip?: number,
    @Query('action') action?: string,
    @Query('resource') resource?: string,
    @Query('userId') userId?: string,
  ): Promise<AuditLogResponseDto[]> {
    const filter: any = {};
    if (action) filter.action = action;
    if (resource) filter.resource = resource;
    if (userId) filter.userId = userId;

    return this.queryBus.execute(new FindAllAuditLogsQuery(filter, {
      limit: limit ? Number(limit) : 100,
      skip: skip ? Number(skip) : 0,
    }));
  }

  @ApiOperation({ summary: 'Get audit log statistics' })
  @ApiResponse({ status: 200, type: [AuditLogStatsDto], description: 'Audit log stats retrieved successfully' })
  @Get('stats')
  async getStats(): Promise<AuditLogStatsDto[]> {
    return this.queryBus.execute(new GetAuditLogStatsQuery());
  }

  @ApiOperation({ summary: 'Find audit logs by resource' })
  @ApiResponse({ status: 200, type: [AuditLogResponseDto], description: 'Audit logs retrieved successfully' })
  @Get('resource/:resource/:resourceId')
  async findByResource(
    @Param('resource') resource: string,
    @Param('resourceId') resourceId: string,
  ): Promise<AuditLogResponseDto[]> {
    return this.queryBus.execute(new FindAuditLogsByResourceQuery(resource, resourceId));
  }

  @ApiOperation({ summary: 'Find audit logs by user' })
  @ApiResponse({ status: 200, type: [AuditLogResponseDto], description: 'Audit logs retrieved successfully' })
  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string): Promise<AuditLogResponseDto[]> {
    return this.queryBus.execute(new FindAuditLogsByUserQuery(userId));
  }
}
