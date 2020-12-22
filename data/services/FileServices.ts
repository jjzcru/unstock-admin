import fs from 'fs';
import path from 'path';
import AWS from 'aws-sdk';
import mime from 'mime-types';

export default class FileServices {
    private apiKey = '';
    private secretKey = '';
    constructor() {
        if (!process.env.S3_API_KEY) {
            throw new Error('Missing S3_API_KEY env variable');
        }

        if (!process.env.S3_SECRET_KEY) {
            throw new Error('Missing S3_SECRET_KEY env variable');
        }
        this.apiKey = process.env.S3_API_KEY;
        this.secretKey = process.env.S3_SECRET_KEY;
    }
    async uploadImages(params: UploadImageParams): Promise<ImageResponse> {
        return new Promise(async (resolve, reject) => {
            const { filePath, key, bucket } = params;
            try {
                const credentials = {
                    accessKeyId: this.apiKey,
                    secretAccessKey: this.secretKey,
                };
                const s3 = new AWS.S3(credentials);

                const fileParams = {
                    Bucket: bucket,
                    Key: key,
                    Body: fs.readFileSync(filePath),
                    ACL: 'public-read',
                    ContentType: mime.contentType(path.extname(key)),
                };

                await this.uploadObject(s3, fileParams);
                const url = `${key}`;
                if (process.env.NODE_ENV === 'production') {
                    fs.unlinkSync(filePath);
                }
                resolve({ url });
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    }

    async deleteImage(params: DeleteImageParams): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const { key, bucket } = params;
            try {
                const s3 = new AWS.S3({
                    accessKeyId: this.apiKey,
                    secretAccessKey: this.secretKey,
                });

                const fileParams = {
                    Bucket: bucket,
                    Key: key,
                };

                s3.deleteObject(fileParams, (err, data) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    console.log(data);
                    resolve();
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    async uploadObject(s3, params) {
        return new Promise((resolve, reject) => {
            s3.putObject(params, (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(data);
            });
        });
    }
}

interface UploadImageParams {
    filePath: string;
    key: string;
    bucket: string;
}

interface DeleteImageParams {
    key: string;
    bucket: string;
}

interface ImageResponse {
    url: string;
}
