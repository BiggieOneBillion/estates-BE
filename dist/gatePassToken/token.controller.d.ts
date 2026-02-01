import { TokenService } from './token.service';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';
import { MeansOfIdentificationDto } from './dto/means-of-identification.dto';
import { UsersService } from 'src/users/users.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
export declare class TokenController {
    private readonly tokenService;
    private readonly userService;
    private readonly cloudinaryService;
    constructor(tokenService: TokenService, userService: UsersService, cloudinaryService: CloudinaryService);
    create(createTokenDto: CreateTokenDto, req: any): Promise<import("./entities/token.entity").Token>;
    createMeansOfIdentification(file: Express.Multer.File, meansOfIdDto: MeansOfIdentificationDto, req: any): Promise<{
        message: string;
        token: import("./entities/token.entity").Token;
    }>;
    findAll(req: any, estateId?: string): Promise<import("./entities/token.entity").Token[]>;
    findUserTokens(req: any, param: {
        id: string;
    }): Promise<import("./entities/token.entity").Token[]>;
    findMyTokens(req: any): Promise<import("./entities/token.entity").Token[]>;
    findOne(tokenId: string): Promise<import("./entities/token.entity").Token>;
    verifyToken(token: string, req: any): Promise<import("./entities/token.entity").Token>;
    verifyVisitorToken(token: string, req: any): Promise<import("./entities/token.entity").Token>;
    update(tokenId: string, updateTokenDto: UpdateTokenDto, req: any): Promise<import("./entities/token.entity").Token>;
    remove(tokenId: string): Promise<void>;
}
