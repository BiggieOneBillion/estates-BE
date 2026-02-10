import { CreateEstateDto } from './dto/create-estate.dto';
import { UpdateEstateDto } from './dto/update-estate.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { EstateResponseDto } from './dto/response/estate.response.dto';
export declare class EstatesController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    create(createEstateDto: CreateEstateDto, request: any): Promise<EstateResponseDto>;
    findAll(): Promise<EstateResponseDto[]>;
    findOne(id: string, request: any): Promise<EstateResponseDto>;
    update(id: string, updateEstateDto: UpdateEstateDto, request: any): Promise<any>;
    remove(id: string, request: any): Promise<any>;
}
