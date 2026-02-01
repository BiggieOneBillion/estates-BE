import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { VerifyVisitorTokenCommand } from '../impl/verify-visitor-token.command';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'src/common/database/soft-delete.plugin';
import { Token, hasUserVerifiedVisitorStatus } from '../../../entities/token.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DomainEvents, TokenEvent } from '../../../../common/events/domain-events';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { FindUserByIdQuery } from '../../../../users/cqrs/queries/impl/find-user-by-id.query';
import { FindSecurityByEstateQuery } from '../../../../users/cqrs/queries/impl/find-security-by-estate.query';

@CommandHandler(VerifyVisitorTokenCommand)
export class VerifyVisitorTokenHandler implements ICommandHandler<VerifyVisitorTokenCommand> {
  constructor(
    @InjectModel(Token.name) private readonly tokenModel: SoftDeleteModel<Token>,
    private readonly eventEmitter: EventEmitter2,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: VerifyVisitorTokenCommand): Promise<Token> {
    const { tokenString, userId } = command;

    const token = await this.tokenModel.findOne({ token: tokenString }).exec();
    if (!token) {
      throw new NotFoundException(`Token ${tokenString} not found`);
    }

    // Check if token belongs to the user
    if (token.user.toString() !== userId) {
      throw new BadRequestException(
        'You are not authorized to verify this token',
      );
    }

    const userInfo = await this.queryBus.execute(new FindUserByIdQuery(userId));
    if (!userInfo) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Update the verification status
    token.hasUserVerifiedVisitor = hasUserVerifiedVisitorStatus.COMPLETED;

    const securityUser = await this.queryBus.execute(new FindSecurityByEstateQuery(userInfo.estateId!.toString()));

    if (!securityUser) {
      throw new NotFoundException(
        'No security user found, Please register a security personnel',
      );
    }

    const securityId = securityUser.id;
    const savedToken = await token.save();

    // Emit Visitor Verified Event
    this.eventEmitter.emit(
      DomainEvents.VISITOR_VERIFIED,
      new TokenEvent(token.user.toString(), (token._id as string).toString(), token.token, { securityId }),
    );

    return savedToken;
  }
}
