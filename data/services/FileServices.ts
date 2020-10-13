import AWS from 'aws-sdk';
import fs from 'fs';

export default class FileServices {
    private apiKey = '';
    private secretKey = '';
    constructor() {
        // TODO Remove defaults
        this.apiKey = process.env.S3_API_KEY || 'AKIAR3PKBWYQOPRF4LN6';
        this.secretKey =
            process.env.S3_SECRET_KEY ||
            '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';
    }
    async uploadImages(params: UploadImageParams): Promise<ImageResponse> {
        return new Promise(async (resolve, reject) => {
            const { path, key, bucket } = params;
            try {
                const s3 = new AWS.S3({
                    accessKeyId: this.apiKey,
                    secretAccessKey: this.secretKey,
                });

                const fileParams = {
                    Bucket: bucket,
                    Key: key,
                    Body: fs.readFileSync(path),
                    ACL: 'public-read',
                };

                await this.uploadObject(s3, fileParams);
                const url = `https://${bucket}.s3.us-east-2.amazonaws.com/${key}`;
                if (process.env.NODE_ENV === 'production') {
                    fs.unlinkSync(path);
                }
                resolve({ url });
            } catch (e) {
                reject(e);
            }
        });
    }

    async deleteImage(params: DeleteImageParams) {
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
    path: string;
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
