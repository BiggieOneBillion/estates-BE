import { EstatesService } from './estates.service';
import { CreateEstateDto } from './dto/create-estate.dto';
import { UpdateEstateDto } from './dto/update-estate.dto';
export declare class EstatesController {
    private readonly estatesService;
    constructor(estatesService: EstatesService);
    create(createEstateDto: CreateEstateDto): Promise<import("./entities/estate.entity").Estate>;
    findAll(): Promise<import("./entities/estate.entity").Estate[]>;
    findOne(id: string): Promise<import("./entities/estate.entity").Estate>;
    update(id: string, updateEstateDto: UpdateEstateDto): Promise<import("./entities/estate.entity").Estate>;
    remove(id: string): Promise<void>;
}
