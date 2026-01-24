import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { VerifyPaymentDto, RejectPaymentDto } from './dto/verify-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly usersService: UsersService,
  ) {}

  @ApiOperation({ summary: 'Submit a payment' })
  @ApiResponse({ status: 201, description: 'Payment submitted successfully' })
  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto, @Request() req) {
    return this.paymentsService.create(createPaymentDto, req.user.userId);
  }

  @ApiOperation({ summary: 'Get my payment history' })
  @ApiResponse({ status: 200, description: 'Payment history retrieved successfully' })
  @Get('my-payments')
  findMyPayments(@Request() req) {
    return this.paymentsService.findUserPayments(req.user.userId);
  }

  @ApiOperation({ summary: 'Get pending payments (Finance Manager)' })
  @ApiResponse({ status: 200, description: 'Pending payments retrieved successfully' })
  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async findPending(@Request() req) {
    const user = await this.usersService.findOne(req.user.userId);
    
    if (!user.estateId) {
      throw new ForbiddenException('User must belong to an estate');
    }

    return this.paymentsService.findPendingPayments(user.estateId.toString());
  }

  @ApiOperation({ summary: 'Get payments for a specific levy' })
  @ApiResponse({ status: 200, description: 'Levy payments retrieved successfully' })
  @Get('levy/:levyId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  findByLevy(@Param('levyId') levyId: string) {
    return this.paymentsService.findPaymentsByLevy(levyId);
  }

  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment retrieved successfully' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @ApiOperation({ summary: 'Verify a payment (Finance Manager)' })
  @ApiResponse({ status: 200, description: 'Payment verified successfully' })
  @Patch(':id/verify')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  verify(
    @Param('id') id: string,
    @Body() verifyDto: VerifyPaymentDto,
    @Request() req,
  ) {
    return this.paymentsService.verifyPayment(id, verifyDto, req.user.userId);
  }

  @ApiOperation({ summary: 'Reject a payment (Finance Manager)' })
  @ApiResponse({ status: 200, description: 'Payment rejected successfully' })
  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  reject(
    @Param('id') id: string,
    @Body() rejectDto: RejectPaymentDto,
    @Request() req,
  ) {
    return this.paymentsService.rejectPayment(id, rejectDto, req.user.userId);
  }
}
