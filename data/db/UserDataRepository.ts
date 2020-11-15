import { Pool, PoolClient } from 'pg';
import { getConnection } from './db';
import { UserRepository } from '@domain/repository/UserRepository';
import { User } from '@domain/model/User';
import { AuthorizationRequest } from '@domain/model/AuthorizationRequest';

export default class UserDataRepository implements UserRepository {
    private pool: Pool;
    constructor() {
        this.pool = getConnection();
    }

    async getAuthRequest(
        request: AuthorizationRequest
    ): Promise<AuthorizationRequest> {
        let client: PoolClient;

        const { storeId, type, email } = request;

        const query = {
            name: `get-auth-request-${new Date().getTime()}`,
            text: `INSERT INTO authorization_request
			(store_id, authorization_type, email)
			VALUES ($1, $2, $3)
			RETURNING *;`,
            values: [storeId, type, email],
        };

        try {
            client = await this.pool.connect();
            const res = await client.query(query);
            if (!!res.rows.length) {
                return toAuthRequest(res.rows[0]);
            }

            return null;
        } catch (e) {
            throw e;
        } finally {
            if (!!client) {
                client.release();
            }
        }
    }

    async validateAuthRequest(request: AuthorizationRequest): Promise<boolean> {
        let client: PoolClient;

        const { storeId, type, email, code } = request;

        const query = {
            name: `get-auth-request-${new Date().getTime()}`,
            text: `SELECT validate_authorization_request
			($1, $2, $3, $4) as is_valid;`,
            values: [storeId, type, email, code],
        };

        try {
            client = await this.pool.connect();
            const res = await client.query(query);
            if (!!res.rows.length) {
                return res.rows[0].is_valid;
            }

            return null;
        } catch (e) {
            throw e;
        } finally {
            if (!!client) {
                client.release();
            }
        }
    }

    async getUserByEmail(email: string): Promise<User> {
        let client: PoolClient;

        const query = {
            name: `get-auth-request-${new Date().getTime()}`,
            text: `SELECT * FROM store_user WHERE email = $1`,
            values: [email],
        };

        try {
            client = await this.pool.connect();
            const res = await client.query(query);
            if (!!res.rows.length) {
                return res.rows[0];
            }

            return null;
        } catch (e) {
            throw e;
        } finally {
            if (!!client) {
                client.release();
            }
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
