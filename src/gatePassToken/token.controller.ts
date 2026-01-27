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
  Query,
  BadRequestException,
  ForbiddenException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { TokenService } from './token.service';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';
import { MeansOfIdentificationDto } from './dto/means-of-identification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiConsumes,
  ApiBearerAuth
} from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  PermissionAction,
  ResourceType,
  UserRole,
} from '../users/entities/user.entity';
import { Roles } from 'src/auth/decorators/role.decorator';
import { UsersService } from 'src/users/users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { VerifiedGuard } from 'src/auth/guards/verified.guard';

@ApiTags('Gate Pass Tokens')
@ApiBearerAuth()
@Controller('tokens')
@UseGuards(JwtAuthGuard, VerifiedGuard, RolesGuard)
export class TokenController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new gate pass token for visitors' })
  @ApiResponse({ status: 201, description: 'Token created successfully' })
  @Roles(
    UserRole.LANDLORD,
    UserRole.TENANT,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  )
  async create(@Body() createTokenDto: CreateTokenDto, @Request() req) {
    // console.log('THE VERY BEGIGNING');
    // check if the user really belongs to the estate they are generating the token for.
    const user = await this.userService.findOne(req.user.userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check if the user is allowed to create tokens
    if (user.canCreateToken === false) {
      throw new ForbiddenException(
        'You are not authorized to create tokens. This feature has been disabled for your account.',
      );
    }

    if (user.estateId!.toString() !== createTokenDto.estate) {
      throw new BadRequestException(
        'You are not authorized to create this token',
      );
    }

    console.log('THE VERY END');
    return this.tokenService.create(createTokenDto, req.user.userId);
  }

  @Post('means-of-identification')
  @ApiOperation({ summary: 'Create means of identification to visitors' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Token means of identification created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Token not found' })
  @UseInterceptors(FileInterceptor('image'))
  @Roles(UserRole.SECURITY, UserRole.SUPER_ADMIN)
  async createMeansOfIdentification(
    @UploadedFile() file: Express.Multer.File,
    @Body() meansOfIdDto: MeansOfIdentificationDto,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException('No identification image uploaded');
    }

    // Find the token
    const token = await this.tokenService.findOne(meansOfIdDto.token);

    // Upload the image to Cloudinary
    const uploadResult = await this.cloudinaryService.uploadImage(file);

    // Update the token with means of identification and image URL
    const updatedToken = await this.tokenService.update(token._id as string, {
      meansOfId: meansOfIdDto.meansOfId!,
      idImgUrl: uploadResult.secure_url!,
    }, req.user.userId, true);

    return {
      message: 'Means of identification added successfully',
      token: updatedToken,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all tokens' })
  @ApiResponse({ status: 200, description: 'Return all tokens' })
  @ApiQuery({
    name: 'estate',
    required: false,
    description: 'Filter by estate ID',
  })
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.SECURITY)
  async findAll(@Request() req, @Query('estateId') estateId?: string) {
    // Get the current user
    const user = await this.userService.findOne(req.user.userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // If estateId is provided, check if user belongs to that estate
    if (estateId) {
      // For SUPER_ADMIN, no additional checks needed
      if (user.primaryRole !== UserRole.SUPER_ADMIN) {
        // Check if user belongs to the estate
        if (user.estateId?.toString() !== estateId) {
          throw new BadRequestException(
            'You are not authorized to access tokens from this estate',
          );
        }
      }
      // For ADMIN role, check if they have the necessary permissions
      if (user.primaryRole === UserRole.ADMIN) {
        // Check if admin has READ or MANAGE permission for SECURITY resource
        const hasPermission =
          user.adminDetails?.positionPermissions?.some(
            (permission) =>
              permission.resource === ResourceType.SECURITY &&
              (permission.actions.includes(PermissionAction.READ) ||
                permission.actions.includes(PermissionAction.MANAGE)),
          ) || false;

        // Also check additional permissions
        const hasAdditionalPermission =
          user.adminDetails?.additionalPermissions?.some(
            (permission) =>
              permission.resource === ResourceType.SECURITY &&
              (permission.actions.includes(PermissionAction.READ) ||
                permission.actions.includes(PermissionAction.MANAGE)),
          ) || false;

        if (!hasPermission && !hasAdditionalPermission) {
          throw new BadRequestException(
            'You do not have permission to access token information',
          );
        }
      }
      // console.log("DONE GIVE ME DATA")
      const data = await this.tokenService.findAllByEstate(estateId);
      return data.filter((el) => el.used);
    } else {
      // If no estateId provided, only SUPER_ADMIN can see all tokens
      if (user.primaryRole !== UserRole.SITE_ADMIN) {
        throw new BadRequestException(
          'Only site admins can view all tokens across estates',
        );
      }

      return this.tokenService.findAll();
    }
  }

  @Get('get-user-tokens/:id')
  @ApiOperation({ summary: 'Get all tokens created by the current user' })
  @ApiResponse({ status: 200, description: 'Return all user tokens' })
  @Roles(UserRole.SUPER_ADMIN)
  async findUserTokens(@Request() req, @Param() param: { id: string }) {
    // check if the user is in the same estate as the super admin
    const superAdmin = await this.userService.findOne(req.user.userId);

    if (!superAdmin) {
      throw new BadRequestException('Super admin not found');
    }

    const user = await this.userService.findOne(param.id);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    if (user.estateId?.toString() !== superAdmin.estateId?.toString()) {
      throw new BadRequestException(
        'You are not authorized to view this user tokens',
      );
    }
    return this.tokenService.findAllByUser(param.id);
  }

  @Get('my-tokens')
  @ApiOperation({ summary: 'Get all tokens created by the current user' })
  @ApiResponse({ status: 200, description: 'Return all user tokens' })
  @Roles(
    UserRole.LANDLORD,
    UserRole.TENANT,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  )
  findMyTokens(@Request() req) {
    return this.tokenService.findAllByUser(req.user.userId);
  }

  @Get(':tokenId')
  @ApiOperation({ summary: 'Get token by id' })
  @ApiResponse({ status: 200, description: 'Return token by id' })
  @Roles(
    // UserRole.LANDLORD,
    // UserRole.TENANT,
    // UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.SECURITY,
  )
  findOne(@Param('tokenId') tokenId: string) {
    return this.tokenService.findByTokenString(tokenId);
  }

  @Get('verify/:token')
  @ApiOperation({ summary: 'Verify a gate pass token' })
  @ApiResponse({ status: 200, description: 'Token verified successfully' })
  @ApiParam({ name: 'token', description: 'The token string to verify' })
  @Roles(UserRole.SECURITY, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  verifyToken(@Param('token') token: string, @Request() req) {
    return this.tokenService.verifyToken(token, req.user.userId);
  }

  @Post('verify-visitor/:token')
  @ApiOperation({ summary: 'Verify a gate pass token' })
  @ApiResponse({ status: 200, description: 'Token verified successfully' })
  @ApiParam({ name: 'token', description: 'The token string to verify' })
  @Roles(UserRole.TENANT, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.LANDLORD)
  verifyVisitorToken(@Param('token') token: string, @Request() req) {
    return this.tokenService.verifyVisitorToken(token, req.user.userId);
  }

  @Patch(':tokenId')
  @ApiOperation({ summary: 'Update token' })
  @ApiResponse({ status: 200, description: 'Token updated successfully' })
  @Roles(
    UserRole.LANDLORD,
    UserRole.TENANT,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  )
  update(
    @Param('tokenId') tokenId: string,
    @Body() updateTokenDto: UpdateTokenDto,
    @Request() req,
  ) {
    // console.log("clean title")
    const user = req.user.userId
    return this.tokenService.update(tokenId, updateTokenDto, user);
  }

  @Delete(':tokenId')
  @ApiOperation({ summary: 'Delete token' })
  @ApiResponse({ status: 200, description: 'Token deleted successfully' })
  @Roles(
    UserRole.LANDLORD,
    UserRole.TENANT,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  )
  remove(@Param('tokenId') tokenId: string) {
    return this.tokenService.remove(tokenId);
  }
}
