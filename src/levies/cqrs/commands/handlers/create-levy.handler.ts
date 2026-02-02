import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateLevyCommand } from '../impl/levy-commands.impl';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'src/common/database/soft-delete.plugin';
import { Levy } from '../../../entities/levy.entity';
import { BadRequestException, Logger } from '@nestjs/common';

@CommandHandler(CreateLevyCommand)
export class CreateLevyHandler implements ICommandHandler<CreateLevyCommand> {
  private readonly logger = new Logger(CreateLevyHandler.name);

  constructor(
    @InjectModel(Levy.name) private readonly levyModel: SoftDeleteModel<Levy>,
  ) {}

  async execute(command: CreateLevyCommand): Promise<Levy> {
    const { createLevyDto, userId, estateId } = command;

    if (new Date(createLevyDto.dueDate) <= new Date()) {
      throw new BadRequestException('Due date must be in the future');
    }

    const newLevy = new this.levyModel({
      ...createLevyDto,
      estateId,
      createdBy: userId,
    });

    const savedLevy = await newLevy.save();
    this.logger.log(`Levy created: ${savedLevy.title} for estate ${estateId}`);
    
    return savedLevy;
  }
}
