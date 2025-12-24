// src/estates/estates.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { EstatesService } from './estates.service';
import { CreateEstateDto } from './dto/create-estate.dto';
import { UpdateEstateDto } from './dto/update-estate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ResourceType, UserRole } from 'src/users/entities/user.entity';
import { Roles } from 'src/auth/decorators/role.decorator';
import { UsersService } from 'src/users/users.service';

@Controller('estates')
@UseGuards(JwtAuthGuard)
export class EstatesController {
  constructor(
    private readonly estatesService: EstatesService,
    private readonly usersService: UsersService,
  ) {}

  @Post('/create')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  create(@Body() createEstateDto: CreateEstateDto, @Request() request) {
    console.log('SHOW MORE WORKS', createEstateDto);
    // console.log('Request body things', (request as any).user);
    const userId = request.user.userId;
    console.log('userId', request.user);
    return this.estatesService.create(createEstateDto, userId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SITE_ADMIN)
  findAll() {
    return this.estatesService.findAll();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async findOne(@Param('id') id: string, @Request() request) {
    const userId = request.user.userId;

    const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.estateId || (user.estateId! && user.estateId.toString() !== id)) {
      throw new NotFoundException(
        'User does not have permission to access this estate',
      );
    }
    return this.estatesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateEstateDto: UpdateEstateDto,
    @Request() request,
  ) {
    const userId = request.user.userId;

    const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.estateId || (user.estateId! && user.estateId.toString() !== id)) {
      throw new NotFoundException(
        'User does not have permission to access this estate',
      );
    }

    return this.estatesService.update(id, updateEstateDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async remove(@Param('id') id: string, @Request() request) {
    const userId = request.user.userId;

    const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.estateId || (user.estateId! && user.estateId.toString() !== id)) {
      throw new NotFoundException(
        'User does not have permission to access this estate',
      );
    }
    return this.estatesService.remove(id);
  }
}
