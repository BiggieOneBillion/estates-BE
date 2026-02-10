import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { PropertyResponseDto } from './dto/response/property.response.dto';
export declare class PropertiesController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    create(createPropertyDto: CreatePropertyDto): Promise<PropertyResponseDto>;
    findAll(): Promise<PropertyResponseDto[]>;
    findByEstate(estateId: string): Promise<PropertyResponseDto[]>;
    findOne(id: string): Promise<PropertyResponseDto>;
    update(id: string, updatePropertyDto: UpdatePropertyDto): Promise<any>;
    remove(id: string): Promise<any>;
}
