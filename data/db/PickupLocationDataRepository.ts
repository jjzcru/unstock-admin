import { Pool, PoolClient } from 'pg';
import { getConnection } from './db';
import { PickupLocationRepository } from '@domain/repository/PickupLocationRepository';
import { PickupLocation } from '@domain/model/PickupLocation';

export default class PickupLocationDataRepository
    implements PickupLocationRepository {
    private pool: Pool;
    constructor() {
        this.pool = getConnection();
    }
    async add(pickupLocation: PickupLocation): Promise<PickupLocation> {
        let client: PoolClient;

        const {
            storeId,
            name,
            additionalDetails,
            latitude,
            longitude,
            isEnabled,
        } = pickupLocation;

        const location = `ST_GeomFromText('SRID=4326;POINT(${latitude} ${longitude})')`;

        const query = {
            name: `add-pickup-location-${new Date().getTime()}`,
            text: `INSERT INTO store_pickup_location (store_id, name, 
                additional_details, latitude, longitude,
                is_enabled, "location") 
                VALUES ($1, $2, $3, $4, $5, $6, ${location})
                RETURNING *;`,
            values: [
                storeId,
                name,
                additionalDetails,
                `${latitude}`,
                `${longitude}`,
                isEnabled,
            ],
        };

        try {
            client = await this.pool.connect();
            const res = await client.query(query);

            if (res.rows && res.rows.length) {
                return toPickupLocation(res.rows[0]);
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
    async update(pickupLocation: PickupLocation): Promise<PickupLocation> {
        let client: PoolClient;

        const {
            id,
            name,
            additionalDetails,
            latitude,
            longitude,
            isEnabled,
        } = pickupLocation;

        const location = `ST_GeomFromText('SRID=4326;POINT(${latitude} ${longitude})')`;

        const query = {
            name: `update-pickup-location-${new Date().getTime()}`,
            text: `UPDATE store_pickup_location SET
            name = $2,
            additional_details = $3,
            latitude = $4,
            longitude = $5,
            is_enabled = $6,
            "location" = ${location}
            WHERE id = $1 RETURNING *;`,
            values: [
                id,
                name,
                additionalDetails,
                `${latitude}`,
                `${longitude}`,
                isEnabled,
            ],
        };

        try {
            client = await this.pool.connect();
            const res = await client.query(query);

            if (res.rows && res.rows.length) {
                return toPickupLocation(res.rows[0]);
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
    async delete(id: string): Promise<PickupLocation> {
        let client: PoolClient;

        const query = {
            name: `delete-pickup-location-by-id-${new Date().getTime()}`,
            text: `DELETE FROM store_pickup_location WHERE id = $1 RETURNING *;`,
            values: [id],
        };

        try {
            client = await this.pool.connect();
            const res = await client.query(query);

            if (res.rows && res.rows.length) {
                return toPickupLocation(res.rows[0]);
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
    async getByID(id: string): Promise<PickupLocation> {
        let client: PoolClient;

        const query = {
            name: `get-pickup-location-by-id-${new Date().getTime()}`,
            text: `SELECT * FROM store_pickup_location WHERE id = $1;`,
            values: [id],
        };

        try {
            client = await this.pool.connect();
            const res = await client.query(query);

            if (res.rows && res.rows.length) {
                return toPickupLocation(res.rows[0]);
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
    async get(storeId: string): Promise<PickupLocation[]> {
        let client: PoolClient;

        const query = {
            name: `get-pickup-locations-by-store-${new Date().getTime()}`,
            text: `SELECT * FROM store_pickup_location WHERE store_id = $1;`,
            values: [storeId],
        };

        try {
            client = await this.pool.connect();
            const res = await client.query(query);

            return res.rows.map(toPickupLocation);
        } catch (e) {
            throw e;
        } finally {
            if (!!client) {
                client.release();
            }
        }
    }
}

function toPickupLocation(row: any): PickupLocation {
    if (!row) {
        return null;
    }
    const {
        id,
        store_id,
        name,
        additional_details,
        latitude,
        longitude,
        created_at,
        updated_at,
    } = row;

    return {
        id,
        name,
        storeId: store_id,
        additionalDetails: additional_details,
        latitude: parseFloat(`${latitude}`),
        longitude: parseFloat(`${longitude}`),
        createdAt: created_at,
        updatedAt: updated_at,
    };
}
