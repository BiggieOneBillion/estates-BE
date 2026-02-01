import { Connection, Model } from 'mongoose';
import { CreateEstateDto } from './dto/create-estate.dto';
import { UpdateEstateDto } from './dto/update-estate.dto';
import { Estate } from './entities/estate.entity';
import { User } from 'src/users/entities/user.entity';
export declare class EstatesService {
    private readonly estateModel;
    private readonly userModel;
    private readonly connection;
    private readonly logger;
    constructor(estateModel: Model<Estate>, userModel: Model<User>, connection: Connection);
    create(createEstateDto: CreateEstateDto, userId: string): Promise<Estate>;
    findAll(): Promise<Estate[]>;
    findOne(id: string): Promise<Estate>;
    update(id: string, updateEstateDto: UpdateEstateDto): Promise<Estate>;
    remove(id: string): Promise<void>;
}
