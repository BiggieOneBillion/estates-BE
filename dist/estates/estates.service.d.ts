import { Model } from 'mongoose';
import { CreateEstateDto } from './dto/create-estate.dto';
import { UpdateEstateDto } from './dto/update-estate.dto';
import { Estate } from './entities/estate.entity';
export declare class EstatesService {
    private readonly estateModel;
    constructor(estateModel: Model<Estate>);
    create(createEstateDto: CreateEstateDto): Promise<Estate>;
    findAll(): Promise<Estate[]>;
    findOne(id: string): Promise<Estate>;
    update(id: string, updateEstateDto: UpdateEstateDto): Promise<Estate>;
    remove(id: string): Promise<void>;
}
