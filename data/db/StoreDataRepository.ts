import { runQuery } from './db';
import { StoreRepository } from '@domain/repository/StoreRepository';
import { Store, StoreEmail } from '@domain/model/Store';

export default class StoreDataRepository implements StoreRepository {
    async getEmail(id: string): Promise<StoreEmail> {
        const query = `SELECT * FROM store_email WHERE store_id = $1`;
        const values = [id];
        const { rows } = await runQuery(query, values);
        return rows && rows.length ? mapRowToStoreEmail(rows[0]) : null;
    }

    async getStoreById(storeId: string): Promise<Store> {
        const query = `SELECT * FROM store WHERE id = $1`;
        const values = [storeId];
        const { rows } = await runQuery(query, values);
        return rows && rows.length ? toStore(rows[0]) : null;
    }

    async getStoreByDomain(domain: string): Promise<Store> {
        const query = `SELECT * FROM store WHERE domain = $1`;
        const values = [domain];
        const { rows } = await runQuery(query, values);
        return rows && rows.length ? toStore(rows[0]) : null;
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
