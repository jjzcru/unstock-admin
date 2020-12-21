import { runQuery } from './db';
import { UserRepository } from '@domain/repository/UserRepository';
import { User } from '@domain/model/User';
import { AuthorizationRequest } from '@domain/model/AuthorizationRequest';

export default class UserDataRepository implements UserRepository {
    async getAuthRequest(
        request: AuthorizationRequest
    ): Promise<AuthorizationRequest> {
        const { storeId, type, email } = request;
        const query = `INSERT INTO authorization_request
        (store_id, authorization_type, email)
        VALUES ($1, $2, $3)
        RETURNING *;`;
        const values = [storeId, type, email];

        const { rows } = await runQuery(query, values);
        if (rows && rows.length) {
            return toAuthRequest(rows[0]);
        }
    }

    async validateAuthRequest(request: AuthorizationRequest): Promise<boolean> {
        const { storeId, type, email, code } = request;

        const query = `SELECT validate_authorization_request
        ($1, $2, $3, $4) as is_valid;`;
        const values = [storeId, type, email, code];

        const { rows } = await runQuery(query, values);
        if (rows && rows.length) {
            return rows[0].is_valid;
        }
    }

    async getUserByEmail(email: string, storeId: string): Promise<User> {
        const query = `SELECT * FROM store_user WHERE email = $1 AND store_id = $2`;
        const values = [email, storeId];

        const { rows } = await runQuery(query, values);
        if (rows && rows.length) {
            return mapUser(rows[0]);
        }
    }
}

function toAuthRequest(row: any): AuthorizationRequest {
    if (!row) {
        return null;
    }

    const { id, store_id, email, code, expire_at, authorization_type } = row;

    return {
        id,
        storeId: store_id,
        email,
        code,
        expireAt: expire_at,
        type: authorization_type,
    };
}

function mapUser(row: any): User {
    if (!row) {
        return null;
    }

    const { id, store_id, name, email, type, created_at, updated_at } = row;

    return {
        id,
        storeId: store_id,
        storeName: null,
        name,
        email,
        type,
        createdAt: created_at,
        updatedAt: updated_at,
    };
}
