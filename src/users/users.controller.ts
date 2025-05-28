import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, Request, ForbiddenException 
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from './entities/user.entity';
import { Roles } from 'src/auth/decorators/role.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ESTATE_ADMIN)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ESTATE_ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ESTATE_ADMIN)
  findOne(@Param('id') id: string, @Request() req) {
    // Allow users to access their own profile
    if (id === req.user.userId || 
        req.user.roles.includes(UserRole.SUPER_ADMIN) || 
        req.user.roles.includes(UserRole.ESTATE_ADMIN)) {
      return this.usersService.findOne(id);
    }
    throw new ForbiddenException('You do not have permission to access this resource');
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ESTATE_ADMIN)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req) {
    // Allow users to update their own profile
    if (id === req.user.userId || 
        req.user.roles.includes(UserRole.SUPER_ADMIN) || 
        req.user.roles.includes(UserRole.ESTATE_ADMIN)) {
      return this.usersService.update(id, updateUserDto);
    }
    throw new ForbiddenException('You do not have permission to update this resource');
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}