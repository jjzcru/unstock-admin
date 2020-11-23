import { Pool, PoolClient } from 'pg';
import { getConnection } from './db';
import {
    PickupLocationRepository,
    ShippingZoneRepository,
} from '@domain/repository/ShippingRepository';
import {
    PickupLocation,
    PickupLocationOption,
} from '@domain/model/PickupLocation';
import { ShippingZone, ShippingOption } from '@domain/model/Shipping';

export class PickupLocationDataRepository implements PickupLocationRepository {
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
    async addOption(
        option: PickupLocationOption
    ): Promise<PickupLocationOption> {
        let client: PoolClient;

        const { paymentMethodId, pickupLocationId } = option;

        const query = {
            name: `add-pickup-location-option-${new Date().getTime()}`,
            text: `INSERT INTO store_pickup_location_option 
                (store_payment_method_id, store_pickup_location_id) 
                VALUES ($1, $2)
                RETURNING *;`,
            values: [paymentMethodId, pickupLocationId],
        };

        try {
            client = await this.pool.connect();
            const res = await client.query(query);

            if (res.rows && res.rows.length) {
                return toPickupLocationOption(res.rows[0]);
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
    async getOptions(
        pickupLocationId: string
    ): Promise<PickupLocationOption[]> {
        let client: PoolClient;

        const query = {
            name: `get-pickup-location-option-${new Date().getTime()}`,
            text: `SELECT * FROM store_pickup_location_option 
            WHERE store_pickup_location_id = $1;`,
            values: [pickupLocationId],
        };

        try {
            client = await this.pool.connect();
            const res = await client.query(query);

            return res.rows.map(toPickupLocationOption);
        } catch (e) {
            throw e;
        } finally {
            if (!!client) {
                client.release();
            }
        }
    }
    async deleteOption(
        option: PickupLocationOption
    ): Promise<PickupLocationOption> {
        let client: PoolClient;

        const {
            paymentMethodId: storePaymentMethodId,
            pickupLocationId: storePickupLocationId,
        } = option;

        const query = {
            name: `delete-pickup-location-option-${new Date().getTime()}`,
            text: `DELETE FROM store_pickup_location_option 
            WHERE store_payment_method_id = $1
            AND store_pickup_location_id = $2 RETURNING *;`,
            values: [storePaymentMethodId, storePickupLocationId],
        };

        try {
            client = await this.pool.connect();
            const res = await client.query(query);

            if (res.rows && res.rows.length) {
                return toPickupLocationOption(res.rows[0]);
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

export class ShippingZoneDataRepository implements ShippingZoneRepository {
    private pool: Pool;
    constructor() {
        this.pool = getConnection();
    }

    async add(shippingZone: ShippingZone): Promise<ShippingZone> {
        let client: PoolClient;

        const { storeId, name, path, isEnabled } = shippingZone;
        const polygonPath = [...path];
        if (path.length) {
            polygonPath.push(path[0]);
        }

        const zone = `ST_GeometryFromText('POLYGON((${polygonPath
            .map((point) => point.map((p) => p).join(' '))
            .join(',')}))')`;

        const query = {
            name: `add-shipping-zone-${new Date().getTime()}`,
            text: `INSERT INTO store_shipping_zone (store_id, name, 
                path, is_enabled, "zone") 
                VALUES ($1, $2, $3, $4, ${zone})
                RETURNING *;`,
            values: [storeId, name, { polygon: path }, isEnabled],
        };

        try {
            client = await this.pool.connect();
            const res = await client.query(query);

            if (res.rows && res.rows.length) {
                return toShippingZone(res.rows[0]);
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
    async update(shippingZone: ShippingZone): Promise<ShippingZone> {
        let client: PoolClient;

        const { id, name, path, isEnabled } = shippingZone;

        const polygonPath = [...path];
        if (path.length) {
            polygonPath.push(path[0]);
        }

        const zone = `ST_GeometryFromText('POLYGON((${polygonPath
            .map((point) => point.map((p) => p).join(' '))
            .join(',')}))')`;

        const query = {
            name: `update-shipping-zone-${new Date().getTime()}`,
            text: `UPDATE store_shipping_zone SET name = $2, path = $3,
            is_enabled = $4,
            "zone" = ${zone}
            WHERE id = $1 RETURNING *;`,
            values: [id, name, { polygon: path }, isEnabled],
        };

        try {
            client = await this.pool.connect();
            const res = await client.query(query);

            if (res.rows && res.rows.length) {
                return toShippingZone(res.rows[0]);
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
    async delete(id: string): Promise<ShippingZone> {
        let client: PoolClient;

        const query = {
            name: `delete-shipping-zone-${new Date().getTime()}`,
            text: `DELETE FROM store_shipping_zone WHERE id = $1 RETURNING *;`,
            values: [id],
        };

        try {
            client = await this.pool.connect();
            const res = await client.query(query);

            if (res.rows && res.rows.length) {
                return toShippingZone(res.rows[0]);
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
    async getByID(id: string): Promise<ShippingZone> {
        let client: PoolClient;

        const query = {
            name: `get-shipping-zone-by-id-${new Date().getTime()}`,
            text: `SELECT * FROM store_shipping_zone 
            WHERE id = $1;`,
            values: [id],
        };

        try {
            client = await this.pool.connect();
            const res = await client.query(query);

            if (res.rows && res.rows.length) {
                return toShippingZone(res.rows[0]);
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
    async get(storeId: string): Promise<ShippingZone[]> {
        let client: PoolClient;

        const query = {
            name: `get-shipping-zones-by-store-${new Date().getTime()}`,
            text: `SELECT * FROM store_shipping_zone WHERE store_id = $1;`,
            values: [storeId],
        };

        try {
            client = await this.pool.connect();
            const res = await client.query(query);

            return res.rows.map(toShippingZone);
        } catch (e) {
            throw e;
        } finally {
            if (!!client) {
                client.release();
            }
        }
    }
    async addOption(option: ShippingOption): Promise<ShippingOption> {
        let client: PoolClient;

        const {
            paymentMethodId,
            shippingZoneId,
            name,
            additionalDetails,
            price,
            isEnabled,
        } = option;

        const query = {
            name: `add-shipping-option-${new Date().getTime()}`,
            text: `INSERT INTO store_shipping_option (store_payment_method_id, 
                shipping_zone_id, name, additional_details, price, is_enabled) 
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *;`,
            values: [
                paymentMethodId,
                shippingZoneId,
                name,
                additionalDetails,
                price,
                isEnabled,
            ],
        };

        try {
            client = await this.pool.connect();
            const res = await client.query(query);

            if (res.rows && res.rows.length) {
                return toShippingOption(res.rows[0]);
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
    async updateOption(option: ShippingOption): Promise<ShippingOption> {
        let client: PoolClient;

        const {
            id,
            paymentMethodId,
            name,
            additionalDetails,
            price,
            isEnabled,
        } = option;

        console.log(`OPTION`);
        console.log(option);

        const query = {
            name: `update-shipping-option-${new Date().getTime()}`,
            text: `UPDATE store_shipping_option SET
                name = $2,
                store_payment_method_id = $3,
                additional_details = $4, 
                price = $5, 
                is_enabled = $6
                WHERE id = $1
                RETURNING *;`,
            values: [
                id,
                name,
                paymentMethodId,
                additionalDetails,
                price,
                isEnabled,
            ],
        };

        try {
            client = await this.pool.connect();
            const res = await client.query(query);

            if (res.rows && res.rows.length) {
                return toShippingOption(res.rows[0]);
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
    async getOptions(zoneId: string): Promise<ShippingOption[]> {
        let client: PoolClient;

        const query = {
            name: `get-shipping-options-${new Date().getTime()}`,
            text: `SELECT * FROM store_shipping_option 
            WHERE shipping_zone_id = $1;`,
            values: [zoneId],
        };

        try {
            client = await this.pool.connect();
            const res = await client.query(query);

            return res.rows.map(toShippingOption);
        } catch (e) {
            throw e;
        } finally {
            if (!!client) {
                client.release();
            }
        }
    }
    async deleteOption(option: ShippingOption): Promise<ShippingOption> {
        let client: PoolClient;

        const { id, shippingZoneId } = option;

        const query = {
            name: `delete-shipping-option-${new Date().getTime()}`,
            text: `DELETE FROM store_shipping_option
                WHERE id = $1 
                AND shipping_zone_id = $2
                RETURNING *;`,
            values: [id, shippingZoneId],
        };

        try {
            client = await this.pool.connect();
            const res = await client.query(query);

            if (res.rows && res.rows.length) {
                return toShippingOption(res.rows[0]);
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
        is_enabled,
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
        isEnabled: is_enabled,
        createdAt: created_at,
        updatedAt: updated_at,
    };
}

function toPickupLocationOption(row: any): PickupLocationOption {
    if (!row) {
        return null;
    }
    const {
        id,
        store_payment_method_id,
        store_pickup_location_id,
        created_at,
        updated_at,
    } = row;

    return {
        id,
        paymentMethodId: store_payment_method_id,
        pickupLocationId: store_pickup_location_id,
        createdAt: created_at,
        updatedAt: updated_at,
    };
}

function toShippingZone(row: any): ShippingZone {
    if (!row) {
        return null;
    }
    const {
        id,
        store_id,
        name,
        path,
        is_enabled,
        created_at,
        updated_at,
    } = row;

    return {
        id,
        storeId: store_id,
        name,
        path: path.polygon,
        isEnabled: is_enabled,
        createdAt: created_at,
        updatedAt: updated_at,
    };
}

function toShippingOption(row: any): ShippingOption {
    if (!row) {
        return null;
    }
    const {
        id,
        store_payment_method_id,
        shipping_zone_id,
        name,
        additional_details,
        price,
        is_enabled,
        created_at,
        updated_at,
    } = row;

    return {
        id,
        paymentMethodId: store_payment_method_id,
        shippingZoneId: shipping_zone_id,
        name,
        additionalDetails: additional_details,
        price: parseFloat(`${price}`),
        isEnabled: is_enabled,
        createdAt: created_at,
        updatedAt: updated_at,
    };
}
