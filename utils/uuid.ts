export function isValidUUID(id: string) {
    if (
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            id
        )
    ) {
        return true;
    }
    return false;
}

export const storeIdHeader = 'x-unstock-store';

export function getStoreID(req) {
    const storeId = req.headers[storeIdHeader];
    if (!storeId || !isValidUUID(storeId)) {
        return null;
    }
    return storeId;
}
