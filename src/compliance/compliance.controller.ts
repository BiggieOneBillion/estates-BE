import {
  Controller,
  Get,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { UserRole } from '../users/entities/user.entity';
import { VerifiedGuard } from 'src/auth/guards/verified.guard';
import { QueryBus } from '@nestjs/cqrs';
import { CheckUserComplianceQuery, GetOutstandingLeviesQuery, GetEstateComplianceReportQuery } from './cqrs/queries/impl/compliance-queries.impl';
import { FindUserByIdQuery } from '../users/cqrs/queries/impl/find-user-by-id.query';

@ApiTags('Compliance')
@ApiBearerAuth()
@Controller('compliance')
@UseGuards(JwtAuthGuard, VerifiedGuard)
export class ComplianceController {
  constructor(
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: 'Get my compliance status' })
  @ApiResponse({ status: 200, description: 'Compliance status retrieved successfully' })
  @Get('status')
  getStatus(@Request() req) {
    return this.queryBus.execute(new CheckUserComplianceQuery(req.user.userId));
  }

  @ApiOperation({ summary: 'Get my outstanding levies' })
  @ApiResponse({ status: 200, description: 'Outstanding levies retrieved successfully' })
  @Get('outstanding')
  getOutstanding(@Request() req) {
    return this.queryBus.execute(new GetOutstandingLeviesQuery(req.user.userId));
  }

  @ApiOperation({ summary: 'Get estate-wide compliance report (Admin)' })
  @ApiResponse({ status: 200, description: 'Compliance report retrieved successfully' })
  @Get('estate-report')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async getEstateReport(@Request() req) {
    const user = await this.queryBus.execute(new FindUserByIdQuery(req.user.userId));
    
    if (!user.estateId) {
      throw new ForbiddenException('User must belong to an estate');
    }

    return this.queryBus.execute(new GetEstateComplianceReportQuery(user.estateId.toString()));
  }
}
