import { Model } from 'mongoose';
import { User } from 'src/users/entities/user.entity';
import { Estate } from 'src/estates/entities/estate.entity';
export declare class InitialSeedService {
    private userModel;
    private estateModel;
    private readonly logger;
    constructor(userModel: Model<User>, estateModel: Model<Estate>);
    seed(): Promise<void>;
}
