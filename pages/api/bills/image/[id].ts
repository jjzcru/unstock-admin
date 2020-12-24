import { AddBillImage } from '@domain/interactors/BillUseCases';

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
            await proxyRequest(req, res, uploadPaymentImage);
            break;

        default:
            res.status(404).send({ error: 'Not found' });
    }
};

async function uploadPaymentImage(req: any, res: any) {
    const {
        query: { id },
    } = req;
    const storeId = getStoreID(req);
    if (!storeId) {
        throwError('INVALID_STORE');
    }

    const data: any = await new Promise((resolve, reject) => {
        const form = new IncomingForm({ multiples: false });
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

    const useCase = new AddBillImage({
        payment_id: id,
        image: images[0],
        storeId,
    });

    res.send(await useCase.execute());
}
