import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { VerifyPaymentDto, RejectPaymentDto } from './dto/verify-payment.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectModel(Payment.name) private readonly paymentModel: Model<Payment>,
  ) {}

  async create(createPaymentDto: CreatePaymentDto, userId: string): Promise<Payment> {
    const newPayment = new this.paymentModel({
      ...createPaymentDto,
      userId,
      paymentDate: createPaymentDto.paymentDate || new Date(),
      status: PaymentStatus.PENDING,
    });

    const savedPayment = await newPayment.save();
    this.logger.log(`Payment submitted by user ${userId} for levy ${createPaymentDto.levyId}`);
    
    return savedPayment;
  }

  async findUserPayments(userId: string): Promise<Payment[]> {
    return this.paymentModel
      .find({ userId })
      .populate('levyId', 'title amount dueDate type')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findPendingPayments(estateId?: string): Promise<Payment[]> {
    const query: any = { status: PaymentStatus.PENDING };
    
    const payments = await this.paymentModel
      .find(query)
      .populate('userId', 'firstName lastName email')
      .populate('levyId', 'title amount dueDate estateId')
      .sort({ createdAt: -1 })
      .exec();

    // Filter by estate if provided
    if (estateId) {
      return payments.filter((payment: any) => 
        payment.levyId?.estateId?.toString() === estateId
      );
    }

    return payments;
  }

  async findPaymentsByLevy(levyId: string): Promise<Payment[]> {
    return this.paymentModel
      .find({ levyId })
      .populate('userId', 'firstName lastName email')
      .populate('verifiedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentModel
      .findById(id)
      .populate('userId', 'firstName lastName email')
      .populate('levyId', 'title amount dueDate')
      .populate('verifiedBy', 'firstName lastName')
      .exec();

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  async verifyPayment(id: string, verifyDto: VerifyPaymentDto, verifierId: string): Promise<Payment> {
    const payment = await this.findOne(id);

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Only pending payments can be verified');
    }

    payment.status = PaymentStatus.VERIFIED;
    payment.verifiedBy = verifierId as any;
    payment.verifiedAt = new Date();
    if (verifyDto.notes) {
      payment.notes = verifyDto.notes;
    }

    const updatedPayment = await payment.save();
    this.logger.log(`Payment ${id} verified by ${verifierId}`);

    return updatedPayment;
  }

  async rejectPayment(id: string, rejectDto: RejectPaymentDto, verifierId: string): Promise<Payment> {
    const payment = await this.findOne(id);

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Only pending payments can be rejected');
    }

    payment.status = PaymentStatus.REJECTED;
    payment.rejectionReason = rejectDto.rejectionReason;
    payment.verifiedBy = verifierId as any;
    payment.verifiedAt = new Date();
    if (rejectDto.notes) {
      payment.notes = rejectDto.notes;
    }

    const updatedPayment = await payment.save();
    this.logger.log(`Payment ${id} rejected by ${verifierId}`);

    return updatedPayment;
  }

  async findVerifiedPayment(userId: string, levyId: string): Promise<Payment | null> {
    return this.paymentModel
      .findOne({
        userId,
        levyId,
        status: PaymentStatus.VERIFIED,
      })
      .exec();
  }

  async hasUserPaidLevy(userId: string, levyId: string): Promise<boolean> {
    const payment = await this.findVerifiedPayment(userId, levyId);
    return !!payment;
  }
}
