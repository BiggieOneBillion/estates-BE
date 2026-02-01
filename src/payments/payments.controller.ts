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
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { PaystackService } from './paystack.service';
import { LeviesService } from '../levies/levies.service';
import { ObjectId } from 'mongoose';
import { VerifiedGuard } from 'src/auth/guards/verified.guard';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(JwtAuthGuard, VerifiedGuard)
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly usersService: UsersService,
    private readonly paystackService: PaystackService,
    private readonly leviesService: LeviesService,
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

  @ApiOperation({ summary: 'Initialize Paystack payment' })
  @ApiResponse({ status: 200, description: 'Payment initialized successfully' })
  @Post('initialize')
  async initializePayment(
    @Body() initializeDto: InitializePaymentDto,
    @Request() req,
  ) {
    const user = await this.usersService.findOne(req.user.userId);
    const levy = await this.leviesService.findOne(
      initializeDto.levyId,
      user?.estateId!.toString(),
    );

    // Create payment record
    const payment = await this.paymentsService.create(
      {
        levyId: initializeDto.levyId,
        amount: initializeDto.amount || levy.amount,
        paymentMethod: 'card' as any,
        paymentDate: new Date(),
      },
      req.user.userId,
    );

    // Initialize Paystack payment
    const paystackData = await this.paystackService.initializePayment({
      email: user.email,
      amount: payment.amount,
      reference: (payment._id as ObjectId).toString(),
      metadata: {
        userId: (user._id as ObjectId).toString(),
        levyId: (levy._id as ObjectId).toString(),
        paymentId: (payment._id as ObjectId).toString(),
        levyTitle: levy.title,
      },
    });

    // Update payment with Paystack reference
    payment.referenceNumber = paystackData.reference;
    await payment.save();

    return {
      paymentId: payment._id,
      authorizationUrl: paystackData.authorizationUrl,
      accessCode: paystackData.accessCode,
      reference: paystackData.reference,
    };
  }

  @ApiOperation({ summary: 'Paystack webhook handler' })
  @Post('paystack/webhook')
  async handlePaystackWebhook(
    @Body() payload: any,
    @Request() req,
  ) {
    // Verify webhook signature
    const signature = req.headers['x-paystack-signature'];
    const isValid = this.paystackService.verifyWebhookSignature(
      JSON.stringify(payload),
      signature,
    );

    if (!isValid) {
      throw new ForbiddenException('Invalid webhook signature');
    }

    // Handle charge.success event
    if (payload.event === 'charge.success') {
      const payment = await this.paymentsService.findOne(payload.data.reference);
      
      if (payment.status === 'pending') {
        payment.status = 'completed' as any;
        payment.referenceNumber = payload.data.reference;
        await payment.save();

        // Auto-verify payment from Paystack
        await this.paymentsService.verifyPayment(
          (payment._id as ObjectId).toString(),
          { notes: 'Auto-verified from Paystack' },
          'system',
        );
      }
    }

    return { status: 'success' };
  }

  @ApiOperation({ summary: 'Verify Paystack payment' })
  @Get('paystack/verify/:reference')
  async verifyPaystackPayment(@Param('reference') reference: string) {
    const paystackData = await this.paystackService.verifyPayment(reference);
    const payment = await this.paymentsService.findOne(reference);

    return {
      payment,
      paystackData,
    };
  }
}
