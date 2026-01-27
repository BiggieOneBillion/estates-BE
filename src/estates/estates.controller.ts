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
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EstatesService } from './estates.service';
import { CreateEstateDto } from './dto/create-estate.dto';
import { UpdateEstateDto } from './dto/update-estate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from 'src/users/entities/user.entity';
import { Roles } from 'src/auth/decorators/role.decorator';
import { UsersService } from 'src/users/users.service';
import { VerifiedGuard } from 'src/auth/guards/verified.guard';

@ApiTags('Estates')
@ApiBearerAuth()
@Controller('estates')
@UseGuards(JwtAuthGuard, VerifiedGuard)
export class EstatesController {
  constructor(
    private readonly estatesService: EstatesService,
    private readonly usersService: UsersService,
  ) {}

  @ApiOperation({
    summary: 'Create a new estate',
    description: 'Allows Super Admins to register a new estate in the system.',
  })
  @ApiResponse({ status: 201, description: 'Estate created successfully' })
  @Post('/create')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  create(@Body() createEstateDto: CreateEstateDto, @Request() request) {
    const userId = request.user.userId;
    return this.estatesService.create(createEstateDto, userId);
  }

  @ApiOperation({
    summary: 'Get all estates',
    description: 'Allows Site Admins to view all estates.',
  })
  @ApiResponse({ status: 200, description: 'List of all estates' })
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SITE_ADMIN)
  findAll() {
    return this.estatesService.findAll();
  }

  @ApiOperation({
    summary: 'Get estate by ID',
    description: 'Allows Super Admins to view details of their own estate.',
  })
  @ApiResponse({ status: 200, description: 'Estate details' })
  @ApiResponse({ status: 404, description: 'Estate not found or unauthorized' })
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async findOne(@Param('id') id: string, @Request() request) {
    const userId = request.user.userId;
    const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.estateId || (user.estateId && user.estateId.toString() !== id)) {
      throw new NotFoundException(
        'User does not have permission to access this estate',
      );
    }
    return this.estatesService.findOne(id);
  }

  @ApiOperation({
    summary: 'Update estate',
    description: 'Allows Super Admins to update details of their estate.',
  })
  @ApiResponse({ status: 200, description: 'Estate updated successfully' })
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

    if (!user.estateId || (user.estateId && user.estateId.toString() !== id)) {
      throw new NotFoundException(
        'User does not have permission to access this estate',
      );
    }

    return this.estatesService.update(id, updateEstateDto);
  }

  @ApiOperation({
    summary: 'Delete estate',
    description: 'Allows Super Admins to delete their estate.',
  })
  @ApiResponse({ status: 200, description: 'Estate deleted successfully' })
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async remove(@Param('id') id: string, @Request() request) {
    const userId = request.user.userId;
    const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.estateId || (user.estateId && user.estateId.toString() !== id)) {
      throw new NotFoundException(
        'User does not have permission to access this estate',
      );
    }
    return this.estatesService.remove(id);
  }
}

