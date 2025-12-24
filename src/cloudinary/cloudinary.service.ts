import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { CLOUDINARY } from './constants/cloudinary.constants';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  constructor(@Inject(CLOUDINARY) private cloudinary) {}

  async uploadFile(file: Express.Multer.File): Promise<UploadApiResponse> {
    console.log('THE BEGINING', file);
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          folder: 'estate-management',
          resource_type: 'auto',
        },
        (error: UploadApiErrorResponse, result: UploadApiResponse) => {
          if (error) {
            console.log('CLOUDINARY ERROR', error);
            return reject(error);
          }
          resolve(result);
        },
      );
      
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
  async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    console.log('THE BEGINING OF A PROMISE', file);
    return new Promise((resolve, reject) => {
      this.cloudinary.uploader
        .upload_stream({ resource_type: 'image' }, (error, result) => {
          if (error) {
            console.log('COOL CAT', error);
            return reject(error);
          }
          resolve(result); // Return the secure URL from Cloudinary
        })
        .end(file.buffer); // Pass the file buffer
    });
  }

  async deleteFile(publicId: string): Promise<any> {
    return this.cloudinary.uploader.destroy(publicId);
  }
}
