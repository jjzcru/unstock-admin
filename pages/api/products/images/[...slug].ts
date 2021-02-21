import {
    AddProductImages,
    DeleteProductImages,
} from '@domain/interactors/ProductsUseCases';

import { isValidUUID, getStoreID } from '@utils/uuid';
import { throwError } from '@errors';
import { proxyRequest } from '@utils/request';

import { IncomingForm } from 'formidable';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async (req: any, res: any) => {
    switch (req.method) {
        case 'POST':
            await proxyRequest(req, res, processPost);
            break;
        case 'DELETE':
            await proxyRequest(req, res, DeleteProductImage);
            break;
        default:
            res.status(404).send({ error: 'Not found' });
    }
};

async function processPost(req: any, res: any) {
    const {
        query: { slug },
    } = req;
    switch (slug[1]) {
        case 'position':
            await uploadImages(req, res);
            break;

        default:
            res.status(404).send({ error: 'Not found' });
    }
}

async function uploadImages(req: any, res: any) {
    const storeId = getStoreID(req);
    const id = req.query.slug[0];
    const position = req.query.slug[2];

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
            index: position,
        };
    });
    console.log(images);
    const useCase = new AddProductImages(id, images, storeId);

    res.send(await useCase.execute());
}

async function DeleteProductImage(req: any, res: any) {
    const id = req.query.slug[0];
    const storeId = getStoreID(req);
    const useCase = new DeleteProductImages(id, storeId);
    res.send(await useCase.execute());
}
