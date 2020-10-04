import {
    AddProductImages,
    UpdateProductImages,
} from '@domain/interactors/ProductsUseCases';

import { isValidUUID, getStoreID } from '@utils/uuid';
import { throwError } from '@errors';
import { proxyRequest } from '@utils/request';

import { IncomingForm } from 'formidable';
import os from 'os';

const tmpDir = os.tmpdir();

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async (req: any, res: any) => {
    switch (req.method) {
        case 'POST':
            await proxyRequest(req, res, uploadImages);
            break;
        case 'PUT':
            await proxyRequest(req, res, updateProductImages);
            break;
        default:
            res.status(404).send({ error: 'Not found' });
    }
};

async function uploadImages(req: any, res: any) {
    const {
        query: { id },
    } = req;
    const storeId = getStoreID(req);

    const data: any = await new Promise((resolve, reject) => {
        const form = new IncomingForm({ multiples: true });
        form.parse(req, (err, fieldList, fileList) => {
            if (err) return reject(err);
            resolve({ fileList });
        });
    });
    let files;
    try {
        files = data.fileList.image.hasOwnProperty('length')
            ? data.fileList.image
            : [data.fileList.image];
    } catch (e) {
        files = [data.fileList.image];
    }

    const images = files.map((file: any) => {
        return {
            name: file.name,
            path: file.path,
        };
    });

    const useCase = new AddProductImages(id, images, storeId);

    res.send(await useCase.execute());
}

async function updateProductImages(req: any, res: any) {
    const {
        query: { id },
    } = req;
    const storeId = getStoreID(req);

    const data: any = await new Promise((resolve, reject) => {
        const form = new IncomingForm({ multiples: true });
        form.parse(req, (err, fieldList, fileList) => {
            if (err) return reject(err);
            resolve({ fileList });
        });
    });
    let files;
    try {
        files = data.fileList.image.hasOwnProperty('length')
            ? data.fileList.image
            : [data.fileList.image];
    } catch (e) {
        files = [data.fileList.image];
    }

    const images = files.map((file: any) => {
        return {
            name: file.name,
            path: file.path,
        };
    });

    const useCase = new UpdateProductImages(id, images, storeId);

    res.send(await useCase.execute());
}
