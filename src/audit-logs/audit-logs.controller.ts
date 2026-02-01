import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/role.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { VerifiedGuard } from 'src/auth/guards/verified.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, VerifiedGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.SITE_ADMIN)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  async findAll(
    @Query('limit') limit?: number,
    @Query('skip') skip?: number,
    @Query('action') action?: string,
    @Query('resource') resource?: string,
    @Query('userId') userId?: string,
  ) {
    const query: any = {};
    if (action) query.action = action;
    if (resource) query.resource = resource;
    if (userId) query.userId = userId;

    return this.auditLogsService.findAll(query, {
      limit: limit ? Number(limit) : 100,
      skip: skip ? Number(skip) : 0,
    });
  }

  @Get('stats')
  async getStats() {
    return this.auditLogsService.getStats();
  }

  @Get('resource/:resource/:resourceId')
  async findByResource(
    @Param('resource') resource: string,
    @Param('resourceId') resourceId: string,
  ) {
    return this.auditLogsService.findByResource(resource, resourceId);
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    return this.auditLogsService.findByUser(userId);
  }
}
