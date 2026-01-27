import { Model } from 'mongoose';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';
import { Token } from './entities/token.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UsersService } from 'src/users/users.service';
import { ComplianceService } from '../compliance/compliance.service';
export declare class TokenService {
    private readonly tokenModel;
    private readonly eventEmitter;
    private readonly userService;
    private readonly complianceService;
    private readonly logger;
    constructor(tokenModel: Model<Token>, eventEmitter: EventEmitter2, userService: UsersService, complianceService: ComplianceService);
    create(createTokenDto: CreateTokenDto, userId: string): Promise<Token>;
    verifyVisitorToken(tokenString: string, userId: string): Promise<Token>;
    findAll(): Promise<Token[]>;
    findAllByUser(userId: string): Promise<Token[]>;
    findAllByEstate(estateId: string): Promise<Token[]>;
    findOne(id: string): Promise<Token>;
    findByTokenString(tokenString: string): Promise<Token>;
    update(id: string, updateTokenDto: UpdateTokenDto, userId: string, isImage?: boolean): Promise<Token>;
    verifyToken(tokenString: string, securityUserId: string): Promise<Token>;
    remove(id: string): Promise<void>;
    private generateUniqueToken;
}
