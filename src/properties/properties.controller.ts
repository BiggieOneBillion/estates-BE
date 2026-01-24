import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from 'src/users/entities/user.entity';
import { Roles } from 'src/auth/decorators/role.decorator';

@ApiTags('Properties')
@ApiBearerAuth()
@Controller('properties')
@UseGuards(JwtAuthGuard)
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @ApiOperation({
    summary: 'Create a new property',
    description: 'Allows Super Admins, Admins, or Landlords to register a new property.',
  })
  @ApiResponse({ status: 201, description: 'Property created successfully' })
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.LANDLORD)
  create(@Body() createPropertyDto: CreatePropertyDto) {
    return this.propertiesService.create(createPropertyDto);
  }

  @ApiOperation({
    summary: 'Get all properties',
    description: 'Retrieves a list of all properties.',
  })
  @ApiResponse({ status: 200, description: 'List of all properties' })
  @Get()
  findAll() {
    return this.propertiesService.findAll();
  }

  @ApiOperation({
    summary: 'Get properties by estate',
    description: 'Retrieves all properties belonging to a specific estate.',
  })
  @ApiResponse({ status: 200, description: 'List of properties in the estate' })
  @Get('estate/:estateId')
  findByEstate(@Param('estateId') estateId: string) {
    return this.propertiesService.findByEstate(estateId);
  }

  @ApiOperation({
    summary: 'Get property by ID',
    description: 'Retrieves details of a specific property.',
  })
  @ApiResponse({ status: 200, description: 'Property details' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(id);
  }

  @ApiOperation({
    summary: 'Update property',
    description: 'Allows Super Admins, Admins, or Landlords to update property details.',
  })
  @ApiResponse({ status: 200, description: 'Property updated successfully' })
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.LANDLORD)
  update(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    return this.propertiesService.update(id, updatePropertyDto);
  }

  @ApiOperation({
    summary: 'Delete property',
    description: 'Allows Super Admins or Admins to delete a property.',
  })
  @ApiResponse({ status: 200, description: 'Property deleted successfully' })
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.propertiesService.remove(id);
  }
}