import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { UpdateTokenCommand } from '../impl/update-token.command';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'src/common/database/soft-delete.plugin';
import { Token, hasUserVerifiedVisitorStatus } from '../../../entities/token.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DomainEvents, TokenEvent } from '../../../../common/events/domain-events';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { FindUserByIdQuery } from '../../../../users/cqrs/queries/impl/find-user-by-id.query';
import { FindSecurityByEstateQuery } from '../../../../users/cqrs/queries/impl/find-security-by-estate.query';

@CommandHandler(UpdateTokenCommand)
export class UpdateTokenHandler implements ICommandHandler<UpdateTokenCommand> {
  constructor(
    @InjectModel(Token.name) private readonly tokenModel: SoftDeleteModel<Token>,
    private readonly eventEmitter: EventEmitter2,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: UpdateTokenCommand): Promise<Token> {
    const { id, updateTokenDto, userId, isImage } = command;

    // 1. Retrieve token and user information
    const token = await this.tokenModel.findById(id).exec();
    if (!token) {
      throw new NotFoundException(`Token with ID ${id} not found`);
    }

    const user = await this.queryBus.execute(new FindUserByIdQuery(userId));
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // 2. Update token in database
    const updatedToken = await this.tokenModel
      .findByIdAndUpdate(id, updateTokenDto, { new: true })
      .exec();

    if (!updatedToken) {
      throw new NotFoundException(`Token with ID ${id} not found`);
    }

    // 3. Handle image verification case
    if (isImage) {
      token.hasUserVerifiedVisitor = hasUserVerifiedVisitorStatus.PENDING;
      await token.save();
    }

    // 4. Get security personnel for notifications
    const securityPersonnel = await this.queryBus.execute(new FindSecurityByEstateQuery(user.estateId!.toString()));

    if (!securityPersonnel) {
      throw new BadRequestException('Invalid security details');
    }

    // 5. Prepare notification data
    const tokenId = (token._id as string).toString();
    const tokenString = token.token;
    const tokenOwnerId = token.user.toString();
    const securityId = securityPersonnel.id.toString();

    // 6. Handle notifications based on verification status
    if (
      updateTokenDto.hasUserVerifiedVisitor &&
      updateTokenDto.hasUserVerifiedVisitor ===
        hasUserVerifiedVisitorStatus.COMPLETED
    ) {
      this.eventEmitter.emit(
        DomainEvents.VISITOR_VERIFIED,
        new TokenEvent(tokenOwnerId, tokenId, tokenString, { securityId }),
      );
    } else if (
      updateTokenDto.hasUserVerifiedVisitor &&
      updateTokenDto.hasUserVerifiedVisitor ===
        hasUserVerifiedVisitorStatus.FAILED
    ) {
      this.eventEmitter.emit(
        DomainEvents.VISITOR_REJECTED,
        new TokenEvent(tokenOwnerId, tokenId, tokenString, { securityId }),
      );
    } else {
      this.eventEmitter.emit(
        DomainEvents.TOKEN_UPDATED,
        new TokenEvent(tokenOwnerId, tokenId, tokenString, { isImage }),
      );
    }

    return updatedToken;
  }
}
