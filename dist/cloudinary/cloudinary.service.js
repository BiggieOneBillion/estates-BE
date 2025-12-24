"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryService = void 0;
const common_1 = require("@nestjs/common");
const cloudinary_constants_1 = require("./constants/cloudinary.constants");
const streamifier = require("streamifier");
let CloudinaryService = class CloudinaryService {
    cloudinary;
    constructor(cloudinary) {
        this.cloudinary = cloudinary;
    }
    async uploadFile(file) {
        console.log('THE BEGINING', file);
        if (!file) {
            throw new common_1.BadRequestException('File is required');
        }
        return new Promise((resolve, reject) => {
            const uploadStream = this.cloudinary.uploader.upload_stream({
                folder: 'estate-management',
                resource_type: 'auto',
            }, (error, result) => {
                if (error) {
                    console.log('CLOUDINARY ERROR', error);
                    return reject(error);
                }
                resolve(result);
            });
            streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
    }
    async uploadImage(file) {
        console.log('THE BEGINING OF A PROMISE', file);
        return new Promise((resolve, reject) => {
            this.cloudinary.uploader
                .upload_stream({ resource_type: 'image' }, (error, result) => {
                if (error) {
                    console.log('COOL CAT', error);
                    return reject(error);
                }
                resolve(result);
            })
                .end(file.buffer);
        });
    }
    async deleteFile(publicId) {
        return this.cloudinary.uploader.destroy(publicId);
    }
};
exports.CloudinaryService = CloudinaryService;
exports.CloudinaryService = CloudinaryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cloudinary_constants_1.CLOUDINARY)),
    __metadata("design:paramtypes", [Object])
], CloudinaryService);
//# sourceMappingURL=cloudinary.service.js.map