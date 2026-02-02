import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { VerifyTokenCommand } from '../impl/verify-token.command';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'src/common/database/soft-delete.plugin';
import { Token, hasUserVerifiedVisitorStatus } from '../../../entities/token.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DomainEvents, TokenEvent } from '../../../../common/events/domain-events';
import { NotFoundException, BadRequestException } from '@nestjs/common';

@CommandHandler(VerifyTokenCommand)
export class VerifyTokenHandler implements ICommandHandler<VerifyTokenCommand> {
  constructor(
    @InjectModel(Token.name) private readonly tokenModel: SoftDeleteModel<Token>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: VerifyTokenCommand): Promise<Token> {
    const { tokenString, securityUserId } = command;

    const token = await this.tokenModel.findOne({ token: tokenString }).exec();
    if (!token) {
      throw new NotFoundException(`Token ${tokenString} not found`);
    }

    // Check if token is expired
    if (new Date() > token.expiresAt) {
      throw new BadRequestException('Token has expired');
    }

    // Check if token is already used
    if (token.used) {
      throw new BadRequestException('Token has already been used');
    }

    if (
      token.hasUserVerifiedVisitor !== hasUserVerifiedVisitorStatus.COMPLETED &&
      token.verifyVisitor
    ) {
      throw new BadRequestException(
        'Visitor has not been verified by occupant',
      );
    }

    // Mark token as used
    token.used = true;
    token.usedAt = new Date();
    token.verifiedBy = securityUserId;

    const savedToken = await token.save();

    // Emit Token Verified Event
    this.eventEmitter.emit(
      DomainEvents.TOKEN_VERIFIED,
      new TokenEvent(token.user.toString(), (token._id as string).toString(), token.token),
    );

    return savedToken;
  }
}
