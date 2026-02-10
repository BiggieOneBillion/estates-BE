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
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreatePropertyCommand } from './cqrs/commands/impl/create-property.command';
import { UpdatePropertyCommand } from './cqrs/commands/impl/update-property.command';
import { DeletePropertyCommand } from './cqrs/commands/impl/delete-property.command';
import { FindAllPropertiesQuery } from './cqrs/queries/impl/find-all-properties.query';
import { FindPropertyByIdQuery } from './cqrs/queries/impl/find-property-by-id.query';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from 'src/users/entities/user.entity';
import { Roles } from 'src/auth/decorators/role.decorator';
import { VerifiedGuard } from 'src/auth/guards/verified.guard';
import { PropertyResponseDto } from './dto/response/property.response.dto';

@ApiTags('Properties')
@ApiBearerAuth()
@Controller('properties')
@UseGuards(JwtAuthGuard, VerifiedGuard)
export class PropertiesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Create a new property',
    description: 'Allows Super Admins, Admins, or Landlords to register a new property.',
  })
  @ApiResponse({ status: 201, type: PropertyResponseDto, description: 'Property created successfully' })
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.LANDLORD)
  create(@Body() createPropertyDto: CreatePropertyDto): Promise<PropertyResponseDto> {
    return this.commandBus.execute(new CreatePropertyCommand(createPropertyDto));
  }

  @ApiOperation({
    summary: 'Get all properties',
    description: 'Retrieves a list of all properties.',
  })
  @ApiResponse({ status: 200, type: [PropertyResponseDto], description: 'List of all properties' })
  @Get()
  findAll(): Promise<PropertyResponseDto[]> {
    return this.queryBus.execute(new FindAllPropertiesQuery());
  }

  @ApiOperation({
    summary: 'Get properties by estate',
    description: 'Retrieves all properties belonging to a specific estate.',
  })
  @ApiResponse({ status: 200, type: [PropertyResponseDto], description: 'List of properties in the estate' })
  @Get('estate/:estateId')
  findByEstate(@Param('estateId') estateId: string): Promise<PropertyResponseDto[]> {
    return this.queryBus.execute(new FindAllPropertiesQuery(estateId));
  }

  @ApiOperation({
    summary: 'Get property by ID',
    description: 'Retrieves details of a specific property.',
  })
  @ApiResponse({ status: 200, type: PropertyResponseDto, description: 'Property details' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @Get(':id')
  findOne(@Param('id') id: string): Promise<PropertyResponseDto> {
    return this.queryBus.execute(new FindPropertyByIdQuery(id));
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
    return this.commandBus.execute(new UpdatePropertyCommand(id, updatePropertyDto));
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
    return this.commandBus.execute(new DeletePropertyCommand(id));
  }
}