export interface AuthorizationRequest {
    id?: string;
    storeId?: string;
    email?: string;
    code?: number;
    expireAt?: Date;
    type?: 'costumer' | 'admin';
}
