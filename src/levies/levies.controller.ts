import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LeviesService } from './levies.service';
import { CreateLevyDto } from './dto/create-levy.dto';
import { UpdateLevyDto } from './dto/update-levy.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { VerifiedGuard } from 'src/auth/guards/verified.guard';

@ApiTags('Levies')
@ApiBearerAuth()
@Controller('levies')
@UseGuards(JwtAuthGuard, VerifiedGuard, RolesGuard)
export class LeviesController {
  constructor(
    private readonly leviesService: LeviesService,
    private readonly usersService: UsersService,
  ) {}

  @ApiOperation({ summary: 'Create a new levy' })
  @ApiResponse({ status: 201, description: 'Levy created successfully' })
  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async create(@Body() createLevyDto: CreateLevyDto, @Request() req) {
    const user = await this.usersService.findOne(req.user.userId);
    
    if (!user.estateId) {
      throw new ForbiddenException('User must belong to an estate');
    }

    return this.leviesService.create(createLevyDto, req.user.userId, user.estateId.toString());
  }

  @ApiOperation({ summary: 'Get all levies for estate' })
  @ApiResponse({ status: 200, description: 'Levies retrieved successfully' })
  @Get()
  async findAll(@Request() req) {
    const user = await this.usersService.findOne(req.user.userId);
    
    if (!user.estateId) {
      throw new ForbiddenException('User must belong to an estate');
    }

    return this.leviesService.findAll(user.estateId.toString());
  }

  @ApiOperation({ summary: 'Get active levies only' })
  @ApiResponse({ status: 200, description: 'Active levies retrieved successfully' })
  @Get('active')
  async findActive(@Request() req) {
    const user = await this.usersService.findOne(req.user.userId);
    
    if (!user.estateId) {
      throw new ForbiddenException('User must belong to an estate');
    }

    return this.leviesService.findActive(user.estateId.toString());
  }

  @ApiOperation({ summary: 'Get levy by ID' })
  @ApiResponse({ status: 200, description: 'Levy retrieved successfully' })
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const user = await this.usersService.findOne(req.user.userId);
    
    if (!user.estateId) {
      throw new ForbiddenException('User must belong to an estate');
    }

    return this.leviesService.findOne(id, user.estateId.toString());
  }

  @ApiOperation({ summary: 'Update a levy' })
  @ApiResponse({ status: 200, description: 'Levy updated successfully' })
  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateLevyDto: UpdateLevyDto,
    @Request() req,
  ) {
    const user = await this.usersService.findOne(req.user.userId);
    
    if (!user.estateId) {
      throw new ForbiddenException('User must belong to an estate');
    }

    return this.leviesService.update(id, updateLevyDto, user.estateId.toString());
  }

  @ApiOperation({ summary: 'Delete a levy' })
  @ApiResponse({ status: 200, description: 'Levy deleted successfully' })
  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  async remove(@Param('id') id: string, @Request() req) {
    const user = await this.usersService.findOne(req.user.userId);
    
    if (!user.estateId) {
      throw new ForbiddenException('User must belong to an estate');
    }

    return this.leviesService.remove(id, user.estateId.toString());
  }
}
