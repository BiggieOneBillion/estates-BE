import { SoftDeleteModel } from 'src/common/database/soft-delete.plugin';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { Property } from './entities/property.entity';
export declare class PropertiesService {
    private readonly propertyModel;
    constructor(propertyModel: SoftDeleteModel<Property>);
    create(createPropertyDto: CreatePropertyDto): Promise<Property>;
    findAll(): Promise<Property[]>;
    findByEstate(estateId: string): Promise<Property[]>;
    findOne(id: string): Promise<Property>;
    update(id: string, updatePropertyDto: UpdatePropertyDto): Promise<Property>;
    remove(id: string): Promise<void>;
}
