export class UnstockError extends Error {
    status: number = 500;
    code: string = 'ERROR';
    data: any;
    stack: any;

    constructor(m: string, type: ErrorType, status?: number) {
        super(m);
        if (!!type) {
            this.code = type;
        }
        if (!!status) {
            this.status = status;
        }

        Object.setPrototypeOf(this, UnstockError.prototype);
    }
}

export type ErrorType =
    | 'MISSING_ARGUMENTS'
    | 'NOT_FOUND'
    | 'INVALID_STORE'
    | 'INVALID_PRODUCT'
    | 'INVALID_ORDER'
    | 'COSTUMER_NOT_FOUND'
    | 'PRODUCT_NOT_FOUND'
    | 'ORDER_NOT_FOUND'
    | 'ORDER_OPERATION_NOT_PERMITTED'
    | null;

interface Params {
    message?: string;
    status?: number;
    data?: any;
    stack?: any;
}

function getError(type: ErrorType): UnstockError {
    if (!type) {
        return new UnstockError('ERROR', null);
    }
    switch (type) {
        case 'MISSING_ARGUMENTS':
            return new UnstockError('Missing Arguments', type, 422);
        case 'NOT_FOUND':
            return new UnstockError('Not found', type, 404);
        case 'COSTUMER_NOT_FOUND':
            return new UnstockError('Costumer not found', type, 404);
        case 'PRODUCT_NOT_FOUND':
            return new UnstockError('Product not found', type, 404);
        case 'ORDER_NOT_FOUND':
            return new UnstockError('Order not found', type, 404);
        case 'INVALID_STORE':
            return new UnstockError('Invalid Store', type, 409);
        case 'INVALID_PRODUCT':
            return new UnstockError('Invalid Product', type, 409);
        case 'INVALID_ORDER':
            return new UnstockError('Invalid Order', type, 409);
        case 'ORDER_OPERATION_NOT_PERMITTED':
            return new UnstockError('Invalid order operation', type, 409);
    }
}

export function throwError(type: ErrorType, params?: Params) {
    let message: string;
    let status: number;
    let data: any;
    let stack: any;

    if (!!params) {
        message = params.message;
        status = params.status;
        data = params.data;
        stack = params.stack;
    }

    const error = getError(type);
    if (!!message) {
        error.message = message;
    }
    if (!!status) {
        error.status = status;
    }
    if (!!data) {
        error.data = data;
    }
    if (!!stack) {
        error.stack = stack;
    }

    throw error;
}
