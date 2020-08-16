import { getStoreID } from './uuid';
import { throwError } from '@errors';

export async function proxyRequest(
    req: any,
    res: any,
    fn: (req: any, res: any) => Promise<any>
) {
    try {
        const storeId = getStoreID(req);
        if (!storeId) {
            throwError('INVALID_STORE');
        }
        await fn(req, res);
    } catch (e) {
        res.status(e.status || 500).send({
            code: e.code || 'ERROR',
            error: e.message,
        });
    }
}
