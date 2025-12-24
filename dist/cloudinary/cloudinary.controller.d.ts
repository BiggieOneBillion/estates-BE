import { CloudinaryService } from './cloudinary.service';
export declare class CloudinaryController {
    private readonly cloudinaryService;
    constructor(cloudinaryService: CloudinaryService);
    uploadFile(file: Express.Multer.File): Promise<{
        message: string;
        publicId: string;
        url: string;
        format: string;
        width: number;
        height: number;
        resourceType: "raw" | "auto" | "image" | "video";
    }>;
}
