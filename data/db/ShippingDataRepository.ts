import { runQuery } from './db';
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
    async add(pickupLocation: PickupLocation): Promise<PickupLocation> {
        const {
            storeId,
            name,
            additionalDetails,
            latitude,
            longitude,
            isEnabled,
        } = pickupLocation;

        const location = `ST_GeomFromText('SRID=4326;POINT(${latitude} ${longitude})')`;

        const query = `INSERT INTO store_pickup_location (store_id, name, 
                additional_details, latitude, longitude,
                is_enabled, "location") 
                VALUES ($1, $2, $3, $4, $5, $6, ${location})
                RETURNING *;`;

        const values = [
            storeId,
            name,
            additionalDetails,
            `${latitude}`,
            `${longitude}`,
            isEnabled,
        ];

        const { rows } = await runQuery(query, values);
        if (rows && rows.length) {
            return toPickupLocation(rows[0]);
        }
        return null;
    }
    async update(pickupLocation: PickupLocation): Promise<PickupLocation> {
        const {
            id,
            name,
            additionalDetails,
            latitude,
            longitude,
            isEnabled,
        } = pickupLocation;

        const location = `ST_GeomFromText('SRID=4326;POINT(${latitude} ${longitude})')`;

        const query = `UPDATE store_pickup_location SET
        name = $2,
        additional_details = $3,
        latitude = $4,
        longitude = $5,
        is_enabled = $6,
        "location" = ${location}
        WHERE id = $1 RETURNING *;`;
        const values = [
            id,
            name,
            additionalDetails,
            `${latitude}`,
            `${longitude}`,
            isEnabled,
        ];
        const { rows } = await runQuery(query, values);

        if (rows && rows.length) {
            return toPickupLocation(rows[0]);
        }
        return null;
    }

    async delete(id: string): Promise<PickupLocation> {
        const query = `DELETE FROM store_pickup_location WHERE id = $1 RETURNING *;`;
        const values = [id];
        const { rows } = await runQuery(query, values);
        if (rows && rows.length) {
            return toPickupLocation(rows[0]);
        }
        return null;
    }

    async getByID(id: string): Promise<PickupLocation> {
        const query = `SELECT * FROM store_pickup_location WHERE id = $1;`;
        const values = [id];
        const { rows } = await runQuery(query, values);
        if (rows && rows.length) {
            return toPickupLocation(rows[0]);
        }
        return null;
    }

    async get(storeId: string): Promise<PickupLocation[]> {
        const query = `SELECT * FROM store_pickup_location WHERE store_id = $1;`;
        const values = [storeId];
        const { rows } = await runQuery(query, values);
        if (rows && rows.length) {
            return rows.map(toPickupLocation);
        }
        return null;
    }

    async addOption(
        option: PickupLocationOption
    ): Promise<PickupLocationOption> {
        const { paymentMethodId, pickupLocationId } = option;

        const query = `INSERT INTO store_pickup_location_option 
        (store_payment_method_id, store_pickup_location_id) 
        VALUES ($1, $2)
        RETURNING *;`;
        const values = [paymentMethodId, pickupLocationId];
        const { rows } = await runQuery(query, values);
        if (rows && rows.length) {
            return toPickupLocationOption(rows[0]);
        }
        return null;
    }

    async getOptions(
        pickupLocationId: string
    ): Promise<PickupLocationOption[]> {
        const query = `SELECT * FROM store_pickup_location_option 
        WHERE store_pickup_location_id = $1;`;

        const values = [pickupLocationId];
        const { rows } = await runQuery(query, values);
        if (rows && rows.length) {
            return rows.map(toPickupLocationOption);
        }
        return null;
    }

    async deleteOption(
        option: PickupLocationOption
    ): Promise<PickupLocationOption> {
        const {
            paymentMethodId: storePaymentMethodId,
            pickupLocationId: storePickupLocationId,
        } = option;

        const query = `DELETE FROM store_pickup_location_option 
        WHERE store_payment_method_id = $1
        AND store_pickup_location_id = $2 RETURNING *;`;

        const values = [storePaymentMethodId, storePickupLocationId];
        const { rows } = await runQuery(query, values);
        if (rows && rows.length) {
            return toPickupLocationOption(rows[0]);
        }
        return null;
    }
}

export class ShippingZoneDataRepository implements ShippingZoneRepository {
    async add(shippingZone: ShippingZone): Promise<ShippingZone> {
        const { storeId, name, path, isEnabled } = shippingZone;
        const polygonPath = [...path];
        if (path.length) {
            polygonPath.push(path[0]);
        }

        const zone = `ST_GeometryFromText('POLYGON((${polygonPath
            .map((point) => point.map((p) => p).join(' '))
            .join(',')}))')`;

        const query = `INSERT INTO store_shipping_zone (store_id, name, 
            path, is_enabled, "zone") 
            VALUES ($1, $2, $3, $4, ${zone})
            RETURNING *;`;

        const values = [storeId, name, { polygon: path }, isEnabled];
        const { rows } = await runQuery(query, values);
        if (rows && rows.length) {
            return toShippingZone(rows[0]);
        }
        return null;
    }

    async update(shippingZone: ShippingZone): Promise<ShippingZone> {
        const { id, name, path, isEnabled } = shippingZone;

        const polygonPath = [...path];
        if (path.length) {
            polygonPath.push(path[0]);
        }

        const zone = `ST_GeometryFromText('POLYGON((${polygonPath
            .map((point) => point.map((p) => p).join(' '))
            .join(',')}))')`;

        const query = `UPDATE store_shipping_zone SET name = $2, path = $3,
        is_enabled = $4,
        "zone" = ${zone}
        WHERE id = $1 RETURNING *;`;

        const values = [id, name, { polygon: path }, isEnabled];
        const { rows } = await runQuery(query, values);
        if (rows && rows.length) {
            return toShippingZone(rows[0]);
        }
        return null;
    }

    async delete(id: string): Promise<ShippingZone> {
        const query = `DELETE FROM store_shipping_zone WHERE id = $1 RETURNING *;`;

        const values = [id];
        const { rows } = await runQuery(query, values);
        if (rows && rows.length) {
            return toShippingZone(rows[0]);
        }
        return null;
    }

    async getByID(id: string): Promise<ShippingZone> {
        const query = `SELECT * FROM store_shipping_zone 
        WHERE id = $1;`;

        const values = [id];
        const { rows } = await runQuery(query, values);
        if (rows && rows.length) {
            return toShippingZone(rows[0]);
        }
        return null;
    }

    async get(storeId: string): Promise<ShippingZone[]> {
        const query = `SELECT * FROM store_shipping_zone WHERE store_id = $1;`;

        const values = [storeId];
        const { rows } = await runQuery(query, values);
        if (rows && rows.length) {
            return rows.map(toShippingZone);
        }
        return null;
    }

    async addOption(option: ShippingOption): Promise<ShippingOption> {
        const {
            paymentMethodId,
            shippingZoneId,
            name,
            additionalDetails,
            price,
            isEnabled,
        } = option;

        const query = `INSERT INTO store_shipping_option (store_payment_method_id, 
            shipping_zone_id, name, additional_details, price, is_enabled) 
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;`;

        const values = [
            paymentMethodId,
            shippingZoneId,
            name,
            additionalDetails,
            price,
            isEnabled,
        ];
        const { rows } = await runQuery(query, values);
        if (rows && rows.length) {
            return toShippingOption(rows[0]);
        }
        return null;
    }

    async updateOption(option: ShippingOption): Promise<ShippingOption> {
        const {
            id,
            paymentMethodId,
            name,
            additionalDetails,
            price,
            isEnabled,
        } = option;

        const query = `UPDATE store_shipping_option SET
        name = $2,
        store_payment_method_id = $3,
        additional_details = $4, 
        price = $5, 
        is_enabled = $6
        WHERE id = $1
        RETURNING *;`;

        const values = [
            id,
            name,
            paymentMethodId,
            additionalDetails,
            price,
            isEnabled,
        ];
        const { rows } = await runQuery(query, values);
        if (rows && rows.length) {
            return toShippingOption(rows[0]);
        }
        return null;
    }

    async getOptions(zoneId: string): Promise<ShippingOption[]> {
        const query = `SELECT * FROM store_shipping_option 
        WHERE shipping_zone_id = $1;`;

        const values = [zoneId];
        const { rows } = await runQuery(query, values);
        if (rows && rows.length) {
            return rows.map(toShippingOption);
        }
        return null;
    }

    async deleteOption(option: ShippingOption): Promise<ShippingOption> {
        const { id, shippingZoneId } = option;

        const query = `DELETE FROM store_shipping_option
        WHERE id = $1 
        AND shipping_zone_id = $2
        RETURNING *;`;

        const values = [id, shippingZoneId];
        const { rows } = await runQuery(query, values);
        if (rows && rows.length) {
            return toShippingOption(rows[0]);
        }
        return null;
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
