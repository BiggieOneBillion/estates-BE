import { EstatesService } from './estates.service';
import { CreateEstateDto } from './dto/create-estate.dto';
import { UpdateEstateDto } from './dto/update-estate.dto';
import { UsersService } from 'src/users/users.service';
export declare class EstatesController {
    private readonly estatesService;
    private readonly usersService;
    constructor(estatesService: EstatesService, usersService: UsersService);
    create(createEstateDto: CreateEstateDto, request: any): Promise<import("./entities/estate.entity").Estate>;
    findAll(): Promise<import("./entities/estate.entity").Estate[]>;
    findOne(id: string, request: any): Promise<import("./entities/estate.entity").Estate>;
    update(id: string, updateEstateDto: UpdateEstateDto, request: any): Promise<import("./entities/estate.entity").Estate>;
    remove(id: string, request: any): Promise<void>;
}
