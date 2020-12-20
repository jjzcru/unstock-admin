import { Pool, PoolClient } from 'pg';
import { getConnection } from './db';
import { StoreRepository } from '@domain/repository/StoreRepository';
import { Store, StoreEmail } from '@domain/model/Store';

export default class StoreDataRepository implements StoreRepository {
    private pool: Pool;
    constructor() {
        this.pool = getConnection();
    }
    async getEmail(id: string): Promise<StoreEmail> {
        let client: PoolClient;

        const query = {
            name: `get-store-email-${new Date().getTime()}`,
            text: `SELECT * FROM store_email WHERE store_id = $1`,
            values: [id],
        };

        try {
            client = await this.pool.connect();
            const res = await client.query(query);

            if (res.rows && res.rows.length) {
                return mapRowToStoreEmail(res.rows[0]);
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

    async getStoreById(storeId: string): Promise<Store> {
        let client: PoolClient;

        const query = {
            name: `get-store-by-id-${new Date().getTime()}`,
            text: `SELECT * FROM store WHERE id = $1`,
            values: [storeId],
        };

        try {
            client = await this.pool.connect();
            const res = await client.query(query);

            if (res.rows && res.rows.length) {
                return toStore(res.rows[0]);
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

    async getStoreByDomain(domain: string): Promise<Store> {
        let client: PoolClient;

        const query = {
            name: `get-store-by-domain-${new Date().getTime()}`,
            text: `SELECT * FROM store WHERE domain = $1`,
            values: [domain],
        };

        try {
            client = await this.pool.connect();
            const res = await client.query(query);

            if (res.rows && res.rows.length) {
                return toStore(res.rows[0]);
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

function toStore(row: any): Store {
    if (!row) {
        return null;
    }
    const { id, name, domain } = row;
    return {
        id,
        name,
        domain,
    };
}

function mapRowToStoreEmail(row: any): StoreEmail {
    if (!row) {
        return null;
    }

    const { id, store_id, theme } = row;

    return {
        id,
        storeId: store_id,
        theme: {
            accent: theme?.accent,
            logo: theme?.logo,
        },
    };
}
