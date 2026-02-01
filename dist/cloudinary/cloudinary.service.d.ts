import { UploadApiResponse } from 'cloudinary';
export declare class CloudinaryService {
    private cloudinary;
    constructor(cloudinary: any);
    uploadFile(file: Express.Multer.File): Promise<UploadApiResponse>;
    uploadImage(file: Express.Multer.File): Promise<UploadApiResponse>;
    deleteFile(publicId: string): Promise<any>;
}
