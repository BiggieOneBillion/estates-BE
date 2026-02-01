import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTokenCommand } from '../impl/create-token.command';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'src/common/database/soft-delete.plugin';
import { Token, hasUserVerifiedVisitorStatus } from '../../../entities/token.entity';
import { ComplianceService } from '../../../../compliance/compliance.service';
import { ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@CommandHandler(CreateTokenCommand)
export class CreateTokenHandler implements ICommandHandler<CreateTokenCommand> {
  private readonly logger = new Logger(CreateTokenHandler.name);

  constructor(
    @InjectModel(Token.name) private readonly tokenModel: SoftDeleteModel<Token>,
    private readonly complianceService: ComplianceService,
  ) {}

  async execute(command: CreateTokenCommand): Promise<Token> {
    const { createTokenDto, userId } = command;

    // 1. Check payment compliance
    const compliance = await this.complianceService.checkUserCompliance(userId);
    
    if (!compliance.canCreateToken) {
      throw new ForbiddenException({
        message: 'Cannot create gate pass token. You have outstanding payments.',
        statusCode: 403,
        error: 'Payment Required',
        outstandingLevies: compliance.outstandingLevies.map(levy => ({
          id: levy._id,
          title: levy.title,
          amount: levy.amount,
          dueDate: levy.dueDate,
          description: levy.description,
        })),
        totalOutstanding: compliance.totalOutstanding,
      });
    }

    // 2. Generate a unique token if not provided
    const tokenData = { ...createTokenDto };
    if (!tokenData.token) {
      tokenData.token = this.generateUniqueToken();
    }

    // Set default expiration time if not provided (24 hours from now)
    if (!tokenData.expiresAt) {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      tokenData.expiresAt = expiresAt;
    }

    // Validate car details
    if (tokenData.hasCar && !tokenData.carPlateNumber) {
      throw new BadRequestException(
        'Car plate number is required when visitor has a car',
      );
    }

    const newToken = new this.tokenModel({
      ...tokenData,
      user: userId,
      hasUserVerifiedVisitor: tokenData.verifyVisitor
        ? hasUserVerifiedVisitorStatus.UNVERIFIED
        : hasUserVerifiedVisitorStatus.COMPLETED,
    });

    return newToken.save();
  }

  private generateUniqueToken(): string {
    return crypto.randomBytes(3).toString('hex').toUpperCase();
  }
}
