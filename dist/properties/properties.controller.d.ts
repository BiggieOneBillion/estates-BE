import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
export declare class PropertiesController {
    private readonly propertiesService;
    constructor(propertiesService: PropertiesService);
    create(createPropertyDto: CreatePropertyDto): Promise<import("./entities/property.entity").Property>;
    findAll(): Promise<import("./entities/property.entity").Property[]>;
    findByEstate(estateId: string): Promise<import("./entities/property.entity").Property[]>;
    findOne(id: string): Promise<import("./entities/property.entity").Property>;
    update(id: string, updatePropertyDto: UpdatePropertyDto): Promise<import("./entities/property.entity").Property>;
    remove(id: string): Promise<void>;
}
