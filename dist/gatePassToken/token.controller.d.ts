import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';
import { MeansOfIdentificationDto } from './dto/means-of-identification.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { TokenResponseDto } from './dto/response/token.response.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
export declare class TokenController {
    private readonly cloudinaryService;
    private readonly commandBus;
    private readonly queryBus;
    constructor(cloudinaryService: CloudinaryService, commandBus: CommandBus, queryBus: QueryBus);
    create(createTokenDto: CreateTokenDto, req: any): Promise<TokenResponseDto>;
    createMeansOfIdentification(file: Express.Multer.File, meansOfIdDto: MeansOfIdentificationDto, req: any): Promise<{
        message: string;
        token: any;
    }>;
    findAll(req: any, estateId?: string): Promise<TokenResponseDto[]>;
    findUserTokens(req: any, param: {
        id: string;
    }): Promise<TokenResponseDto[]>;
    findMyTokens(req: any): Promise<TokenResponseDto[]>;
    findOne(tokenId: string): Promise<TokenResponseDto>;
    verifyToken(token: string, req: any): Promise<any>;
    verifyVisitorToken(token: string, req: any): Promise<any>;
    update(tokenId: string, updateTokenDto: UpdateTokenDto, req: any): Promise<any>;
    remove(tokenId: string): Promise<any>;
}
