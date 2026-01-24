import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';
import {
  hasUserVerifiedVisitorStatus,
  Token,
} from './entities/token.entity';
import * as crypto from 'crypto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DomainEvents, TokenEvent } from '../common/events/domain-events';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    @InjectModel(Token.name) private readonly tokenModel: Model<Token>,
    private readonly eventEmitter: EventEmitter2,
    private readonly userService: UsersService,
  ) {}

  async create(createTokenDto: CreateTokenDto, userId: string): Promise<Token> {
    // Generate a unique token if not provided
    if (!createTokenDto.token) {
      createTokenDto.token = this.generateUniqueToken();
    }

    // Set default expiration time if not provided (24 hours from now)
    if (!createTokenDto.expiresAt) {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      createTokenDto.expiresAt = expiresAt;
    }

    // Validate car details
    if (createTokenDto.hasCar && !createTokenDto.carPlateNumber) {
      throw new BadRequestException(
        'Car plate number is required when visitor has a car',
      );
    }

    const newToken = new this.tokenModel({
      ...createTokenDto,
      user: userId,
      hasUserVerifiedVisitor: createTokenDto.verifyVisitor
        ? hasUserVerifiedVisitorStatus.UNVERIFIED
        : hasUserVerifiedVisitorStatus.COMPLETED,
    });

    return newToken.save();
  }

  // ... existing code ...

  async verifyVisitorToken(
    tokenString: string,
    userId: string,
  ): Promise<Token> {
    const token = await this.findByTokenString(tokenString);

    // Check if token belongs to the user
    if (token.user.toString() !== userId) {
      throw new BadRequestException(
        'You are not authorized to verify this token',
      );
    }

    const userInfo = await this.userService.findOne(userId);

    // Update the verification status
    token.hasUserVerifiedVisitor = hasUserVerifiedVisitorStatus.COMPLETED;

    const securityUser = await this.userService.findSecurity(
      userInfo.estateId!.toString(),
    );
    // const securityUser = await this.userService.findByRole(UserRole.SECURITY);

    if (!securityUser) {
      throw new NotFoundException(
        'No security user found, Please register a security personnel',
      );
    }

    const user = securityUser.id;

    const savedToken = await token.save();

    // Emit Visitor Verified Event
    this.eventEmitter.emit(
      DomainEvents.VISITOR_VERIFIED,
      new TokenEvent(token.user.toString(), (token._id as string).toString(), token.token, { securityId: user }),
    );

    return savedToken;
  }

  // ... existing code ...

  async findAll(): Promise<Token[]> {
    return this.tokenModel.find().exec();
  }

  async findAllByUser(userId: string): Promise<Token[]> {
    return this.tokenModel.find({ user: userId }).exec();
  }

  async findAllByEstate(estateId: string): Promise<Token[]> {
    return this.tokenModel.find({ estate: estateId }).exec();
  }

  async findOne(id: string): Promise<Token> {
    const token = await this.tokenModel.findById(id).exec();
    if (!token) {
      throw new NotFoundException(`Token with ID ${id} not found`);
    }
    return token;
  }

  async findByTokenString(tokenString: string): Promise<Token> {
    const token = await this.tokenModel.findOne({ token: tokenString }).exec();
    if (!token) {
      throw new NotFoundException(`Token ${tokenString} not found`);
    }
    return token;
  }

  // async update(
  //   id: string,
  //   updateTokenDto: UpdateTokenDto,
  //   userId: string,
  //   isImage?: boolean,
  // ): Promise<Token> {
  //   // get the token details
  //   const token = await this.findOne(id);
  //   const user = await this.userService.findOne(userId); //! please review this later
  //   // check if the token is expired
  //   // if (new Date() > token.expiresAt) {
  //   //   throw new BadRequestException('Token has expired');
  //   // }
  //   // if (token.user.toString() !== userId) {
  //   //   throw new BadRequestException(
  //   //     'You are not authorized to update this token',
  //   //   );
  //   // }
  //   // update the token
  //   const updatedToken = await this.tokenModel
  //     .findByIdAndUpdate(id, updateTokenDto, { new: true })
  //     .exec();
  //   if (!updatedToken) {
  //     throw new NotFoundException(`Token with ID ${id} not found`);
  //   }

  //   if (isImage) {
  //     // update the verification status
  //     token.hasUserVerifiedVisitor = hasUserVerifiedVisitorStatus.PENDING;
  //     await token.save();
  //   }

  //   // console.log("SWEET BOY PRESIDO")

  //   const securityPersonnel = await this.userService.findSecurity(
  //     user.estateId!.toString(),
  //   );
  //   // console.log('SHOW ME POWER');
  //   if (!securityPersonnel) {
  //     throw new BadRequestException('Invalid security details');
  //   }

  //   if (
  //     updateTokenDto.hasUserVerifiedVisitor &&
  //     updateTokenDto.hasUserVerifiedVisitor ===
  //       hasUserVerifiedVisitorStatus.COMPLETED
  //   ) {
  //     // console.log("notifications---------power play-----------", "happy home")
  //     // Create notification for visitor verification
  //     await this.notificationsService.createTokenNotification(
  //       token.user.toString(),
  //       (token._id as string).toString(),
  //       token.token,
  //       NotificationType.VISITOR_VERIFIED,
  //       false,
  //     );

  //     // Send WebSocket event to the user
  //     this.eventsService.sendToUser(
  //       securityPersonnel.id.toString(),
  //       'visitor_verified',
  //       {
  //         tokenId: token._id,
  //         token: token.token,
  //         type: NotificationType.VISITOR_VERIFIED,
  //         timestamp: new Date(),
  //       },
  //     );
  //   } else if (
  //     updateTokenDto.hasUserVerifiedVisitor &&
  //     updateTokenDto.hasUserVerifiedVisitor ===
  //       hasUserVerifiedVisitorStatus.FAILED
  //   ) {
  //     await this.notificationsService.createTokenNotification( // to notify the user that the visitor verification failed
  //       token.user.toString(),
  //       (token._id as string).toString(),
  //       token.token,
  //       NotificationType.TOKEN_UPDATED,
  //       true,
  //     );

  //     await this.notificationsService.createTokenNotification( // to notify the security personnel
  //       securityPersonnel.id.toString(),
  //       (token._id as string).toString(),
  //       token.token,
  //       NotificationType.TOKEN_UPDATED,
  //       true,
  //     );
  //     // send a notification to the security to tell them that the visitor's verification failed
  //     this.eventsService.sendToUser(
  //       securityPersonnel.id.toString(),
  //       'visitor_rejected',
  //       {
  //         tokenId: token._id,
  //         token: token.token,
  //         type: NotificationType.TOKEN_UPDATED,
  //         timestamp: new Date(),
  //       },
  //     );
  //     //
  //   } else {
  //     // Create notification for token update
  //     await this.notificationsService.createTokenNotification(
  //       token.user.toString(),
  //       (token._id as string).toString(),
  //       token.token,
  //       isImage
  //         ? NotificationType.VERIFY_VISTOR
  //         : NotificationType.TOKEN_UPDATED,
  //       true,
  //     );
  //     // Send WebSocket event to the user
  //     this.eventsService.sendToUser(token.user.toString(), 'user_updated', {
  //       tokenId: token._id,
  //       token: token.token,
  //       type: isImage
  //         ? NotificationType.VERIFY_VISTOR
  //         : NotificationType.TOKEN_UPDATED,
  //       timestamp: new Date(),
  //     });
  //   }

  //   return updatedToken;
  // }

  async update(
    id: string,
    updateTokenDto: UpdateTokenDto,
    userId: string,
    isImage?: boolean,
  ): Promise<Token> {
    // 1. Retrieve token and user information - combine database operations
    const [token, user] = await Promise.all([
      this.findOne(id),
      this.userService.findOne(userId),
    ]);

    // 2. Update token in database
    const updatedToken = await this.tokenModel
      .findByIdAndUpdate(id, updateTokenDto, { new: true })
      .exec();

    if (!updatedToken) {
      throw new NotFoundException(`Token with ID ${id} not found`);
    }

    // 3. Handle image verification case - only save if needed
    if (isImage) {
      token.hasUserVerifiedVisitor = hasUserVerifiedVisitorStatus.PENDING;
      await token.save();
    }

    // 4. Get security personnel for notifications
    const securityPersonnel = await this.userService.findSecurity(
      user.estateId!.toString(),
    );

    if (!securityPersonnel) {
      throw new BadRequestException('Invalid security details');
    }

    // 5. Prepare notification data once to avoid repetition
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
      // Case: Visitor verification completed
      this.eventEmitter.emit(
        DomainEvents.VISITOR_VERIFIED,
        new TokenEvent(tokenOwnerId, tokenId, tokenString, { securityId }),
      );
    } else if (
      updateTokenDto.hasUserVerifiedVisitor &&
      updateTokenDto.hasUserVerifiedVisitor ===
        hasUserVerifiedVisitorStatus.FAILED
    ) {
      // Case: Visitor verification failed
      this.eventEmitter.emit(
        DomainEvents.VISITOR_REJECTED,
        new TokenEvent(tokenOwnerId, tokenId, tokenString, { securityId }),
      );
    } else {
      // Case: General token update
      this.eventEmitter.emit(
        DomainEvents.TOKEN_UPDATED,
        new TokenEvent(tokenOwnerId, tokenId, tokenString, { isImage }),
      );
    }

    return updatedToken;
  }

  async verifyToken(
    tokenString: string,
    securityUserId: string,
  ): Promise<Token> {
    const token = await this.findByTokenString(tokenString);

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

  async remove(id: string): Promise<void> {
    const result = await this.tokenModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Token with ID ${id} not found`);
    }
  }

  private generateUniqueToken(): string {
    // Generate a 6-character alphanumeric token
    return crypto.randomBytes(3).toString('hex').toUpperCase();
  }
}
