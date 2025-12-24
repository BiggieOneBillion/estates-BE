import { Model } from 'mongoose';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';
import { Token } from './entities/token.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { EventsService } from 'src/events/events.service';
import { UsersService } from 'src/users/users.service';
export declare class TokenService {
    private readonly tokenModel;
    private readonly notificationsService;
    private readonly eventsService;
    private readonly userService;
    constructor(tokenModel: Model<Token>, notificationsService: NotificationsService, eventsService: EventsService, userService: UsersService);
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
