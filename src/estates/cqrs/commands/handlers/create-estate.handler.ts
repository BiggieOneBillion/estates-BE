import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateEstateCommand } from '../impl/create-estate.command';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, ObjectId } from 'mongoose';
import { Estate } from '../../../entities/estate.entity';
import { User } from 'src/users/entities/user.entity';
import { ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { SoftDeleteModel } from 'src/common/database/soft-delete.plugin';

@CommandHandler(CreateEstateCommand)
export class CreateEstateHandler implements ICommandHandler<CreateEstateCommand> {
  private readonly logger = new Logger(CreateEstateHandler.name);

  constructor(
    @InjectModel(Estate.name) private readonly estateModel: SoftDeleteModel<Estate>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async execute(command: CreateEstateCommand): Promise<Estate> {
    const { createEstateDto, userId } = command;
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const existingEstate = await this.estateModel
        .findOne({ name: createEstateDto.name })
        .session(session);

      if (existingEstate) {
        throw new ConflictException('Estate name already exists');
      }

      const user = await this.userModel.findById(userId).session(session);

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      if (!user.isEmailVerified) {
        throw new ConflictException('User email not verified yet. Cannot create estate');
      }

      if (user.estateId) {
        throw new ConflictException('User already has an estate');
      }

      const newEstate = new this.estateModel({
        ...createEstateDto,
        owner: userId,
      });

      await newEstate.save({ session });

      user.estateId = newEstate._id as unknown as ObjectId;
      await user.save({ session });

      await session.commitTransaction();
      this.logger.log(`Estate "${newEstate.name}" created successfully for user ${userId}`);
      
      return newEstate;
    } catch (error) {
      await session.abortTransaction();
      this.logger.error(`Failed to create estate: ${error.message}`);
      throw error;
    } finally {
      session.endSession();
    }
  }
}
