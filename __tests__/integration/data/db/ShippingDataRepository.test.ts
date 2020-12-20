import { closeConnection } from '@data/db/db';
import {
    PickupLocation,
    PickupLocationOption,
} from '@domain/model/PickupLocation';
import { ShippingOption, ShippingZone } from '@domain/model/Shipping';
import {
    PickupLocationRepository,
    ShippingZoneRepository,
} from '@domain/repository/ShippingRepository';
import {
    PickupLocationDataRepository,
    ShippingZoneDataRepository,
} from '@data/db/ShippingDataRepository';

describe.skip('ShippingDataRepository', () => {
    const storeId: string = '04c4315e-c73f-49a6-acbf-cf91a07996e3';
    const paymentMethodId: string = '1baf3aaf-f4dc-40c4-838e-e6931193184b';
    describe.skip('PickupLocationDataRepository', () => {
        let pickupLocationRepository: PickupLocationRepository;

        const params: PickupLocation = {
            storeId,
            latitude: 5.423522,
            longitude: -80.144084,
            name: 'Test',
            additionalDetails: 'test',
        };

        const pickupLocationOptionParams: PickupLocationOption = {
            paymentMethodId,
        };

        beforeAll(async () => {
            pickupLocationRepository = new PickupLocationDataRepository();
        });

        it('Should create a pickup location', async () => {
            const pickupLocation = await pickupLocationRepository.add(params);
            params.id = pickupLocation.id;

            expect(pickupLocation).not.toBeNull();
            expect(pickupLocation.id).not.toBeUndefined();
            expect(pickupLocation.storeId).toEqual(params.storeId);
            expect(pickupLocation.latitude).toEqual(params.latitude);
            expect(pickupLocation.longitude).toEqual(params.longitude);
            expect(pickupLocation.name).toEqual(params.name);
            expect(pickupLocation.additionalDetails).toEqual(
                params.additionalDetails
            );
        }, 60000);

        it('Should get a pickup location by id', async () => {
            const { id } = params;
            const pickupLocation = await pickupLocationRepository.getByID(id);
            expect(pickupLocation).not.toBeNull();
            expect(pickupLocation.id).toEqual(id);
            expect(pickupLocation.storeId).toEqual(params.storeId);
            expect(pickupLocation.latitude).toEqual(params.latitude);
            expect(pickupLocation.longitude).toEqual(params.longitude);
            expect(pickupLocation.name).toEqual(params.name);
            expect(pickupLocation.additionalDetails).toEqual(
                params.additionalDetails
            );
        }, 60000);

        it('Should get a pickup locations by store', async () => {
            const pickupLocations = await pickupLocationRepository.get(
                params.storeId
            );

            expect(pickupLocations.length).toBeGreaterThan(0);
            for (const pickupLocation of pickupLocations) {
                if (pickupLocation.id === params.id) {
                    expect(pickupLocation).not.toBeNull();
                    expect(pickupLocation.id).toEqual(params.id);
                    expect(pickupLocation.storeId).toEqual(params.storeId);
                    expect(pickupLocation.latitude).toEqual(params.latitude);
                    expect(pickupLocation.longitude).toEqual(params.longitude);
                    expect(pickupLocation.name).toEqual(params.name);
                    expect(pickupLocation.additionalDetails).toEqual(
                        params.additionalDetails
                    );
                }
            }
        }, 60000);

        it('Should update a pickup location by id', async () => {
            params.latitude = -80.144084;
            params.longitude = 5.423522;
            params.name = 'Example';
            params.additionalDetails = 'Example';

            const pickupLocation = await pickupLocationRepository.update(
                params
            );
            expect(pickupLocation).not.toBeNull();
            pickupLocationOptionParams.pickupLocationId = pickupLocation.id;
            expect(pickupLocation.id).toEqual(params.id);
            expect(pickupLocation.storeId).toEqual(params.storeId);
            expect(pickupLocation.latitude).toEqual(params.latitude);
            expect(pickupLocation.longitude).toEqual(params.longitude);
            expect(pickupLocation.name).toEqual(params.name);
            expect(pickupLocation.additionalDetails).toEqual(
                params.additionalDetails
            );
        }, 60000);

        it('Should add pickup location option', async () => {
            const pickupLocationOption = await pickupLocationRepository.addOption(
                pickupLocationOptionParams
            );

            expect(pickupLocationOption).not.toBeNull();
            pickupLocationOptionParams.id = pickupLocationOption.id;
            pickupLocationOptionParams.pickupLocationId =
                pickupLocationOption.pickupLocationId;
            expect(pickupLocationOption.paymentMethodId).toEqual(
                paymentMethodId
            );
        }, 60000);

        it('Should get pickup locations options by pickup location', async () => {
            const pickupLocationOptions = await pickupLocationRepository.getOptions(
                pickupLocationOptionParams.id
            );
            for (const pickupLocationOption of pickupLocationOptions) {
                if (pickupLocationOption.id === pickupLocationOptionParams.id) {
                    expect(pickupLocationOption).not.toBeNull();
                    expect(pickupLocationOption.id).toEqual(
                        pickupLocationOptionParams.id
                    );
                    expect(pickupLocationOption.pickupLocationId).toEqual(
                        pickupLocationOptionParams.pickupLocationId
                    );
                    expect(pickupLocationOption.paymentMethodId).toEqual(
                        paymentMethodId
                    );
                }
            }
        }, 60000);

        it('Should delete pickup location option', async () => {
            const pickupLocationOption = await pickupLocationRepository.deleteOption(
                pickupLocationOptionParams
            );

            expect(pickupLocationOption).not.toBeNull();
            expect(pickupLocationOption.id).toEqual(
                pickupLocationOptionParams.id
            );
            pickupLocationOptionParams.id = pickupLocationOption.id;
            expect(pickupLocationOption.pickupLocationId).toEqual(
                pickupLocationOptionParams.pickupLocationId
            );
            expect(pickupLocationOption.paymentMethodId).toEqual(
                paymentMethodId
            );
        }, 60000);

        it('Should delete a pickup location by id', async () => {
            const pickupLocation = await pickupLocationRepository.delete(
                params.id
            );
            expect(pickupLocation).not.toBeNull();
            expect(pickupLocation.id).toEqual(params.id);
            expect(pickupLocation.storeId).toEqual(params.storeId);
            expect(pickupLocation.latitude).toEqual(params.latitude);
            expect(pickupLocation.longitude).toEqual(params.longitude);
            expect(pickupLocation.name).toEqual(params.name);
            expect(pickupLocation.additionalDetails).toEqual(
                params.additionalDetails
            );
        }, 60000);

        afterAll(async () => {
            await closeConnection();
        });
    });
    describe.skip('ShippingZoneDataRepository', () => {
        let shippingZoneRepository: ShippingZoneRepository;

        const params: ShippingZone = {
            storeId,
            name: 'Test',
            path: [
                [51.515, -0.09],
                [51.52, -0.1],
                [51.52, -0.12],
            ],
            isEnabled: true,
        };

        const shippingOptionParams: ShippingOption = {
            paymentMethodId,
            name: 'Test',
            additionalDetails: 'Test',
            price: 0.99,
            isEnabled: true,
        };

        beforeAll(async () => {
            shippingZoneRepository = new ShippingZoneDataRepository();
        });

        it('Should create a shipping zone', async () => {
            const shippingZone = await shippingZoneRepository.add(params);
            params.id = shippingZone.id;
            shippingOptionParams.shippingZoneId = params.id;

            expect(shippingZone).not.toBeNull();
            expect(shippingZone.id).not.toBeUndefined();
            expect(shippingZone.storeId).toEqual(params.storeId);
            expect(shippingZone.name).toEqual(params.name);
            expect(shippingZone.path).toEqual(params.path);
            expect(shippingZone.isEnabled).toEqual(params.isEnabled);
        }, 60000);

        it('Should update a shipping zone', async () => {
            const { id } = params;
            params.name = 'Example';
            params.path = [
                [50.515, -0.09],
                [50.52, -0.1],
                [50.52, -0.12],
            ];
            params.isEnabled = false;
            const shippingZone = await shippingZoneRepository.update(params);

            expect(shippingZone).not.toBeNull();
            expect(shippingZone.id).toEqual(id);
            expect(shippingZone.storeId).toEqual(storeId);
            expect(shippingZone.name).toEqual(params.name);
            expect(shippingZone.path).toEqual(params.path);
            expect(shippingZone.isEnabled).toEqual(params.isEnabled);
        }, 60000);

        it('Should get a shipping zone by id', async () => {
            const { id, name, path, isEnabled } = params;
            const shippingZone = await shippingZoneRepository.getByID(id);

            expect(shippingZone).not.toBeNull();
            expect(shippingZone.id).toEqual(id);
            expect(shippingZone.storeId).toEqual(storeId);
            expect(shippingZone.name).toEqual(name);
            expect(shippingZone.path).toEqual(path);
            expect(shippingZone.isEnabled).toEqual(isEnabled);
        }, 60000);

        it('Should get a shipping zones by store', async () => {
            const { id, name, path, isEnabled } = params;
            const shippingZones = await shippingZoneRepository.get(storeId);
            expect(shippingZones.length).toBeGreaterThan(0);

            for (const shippingZone of shippingZones) {
                if (shippingZone.id === id) {
                    expect(shippingZone.storeId).toEqual(storeId);
                    expect(shippingZone.name).toEqual(name);
                    expect(shippingZone.path).toEqual(path);
                    expect(shippingZone.isEnabled).toEqual(isEnabled);
                }
            }
        }, 60000);

        it('Should create a shipping option', async () => {
            const shippingOption = await shippingZoneRepository.addOption(
                shippingOptionParams
            );
            shippingOptionParams.id = shippingOption.id;

            expect(shippingOption).not.toBeNull();
            shippingOptionParams.id = shippingOption.id;
            expect(shippingOption.name).toEqual(shippingOptionParams.name);
            expect(shippingOption.additionalDetails).toEqual(
                shippingOptionParams.additionalDetails
            );
            expect(shippingOption.price).toEqual(shippingOptionParams.price);
            expect(shippingOption.isEnabled).toEqual(
                shippingOptionParams.isEnabled
            );
        }, 60000);

        it('Should update a shipping option', async () => {
            const { id } = shippingOptionParams;
            shippingOptionParams.name = 'Example';
            shippingOptionParams.additionalDetails = 'Example';
            shippingOptionParams.price = 1.99;
            shippingOptionParams.isEnabled = true;

            const shippingOption = await shippingZoneRepository.updateOption(
                shippingOptionParams
            );

            expect(shippingOption).not.toBeNull();
            expect(shippingOption.id).toEqual(id);
            expect(shippingOption.name).toEqual(shippingOptionParams.name);
            expect(shippingOption.additionalDetails).toEqual(
                shippingOptionParams.additionalDetails
            );
            expect(shippingOption.price).toEqual(shippingOptionParams.price);
            expect(shippingOption.isEnabled).toEqual(
                shippingOptionParams.isEnabled
            );
        }, 60000);

        it('Should get a shipping option from a zone', async () => {
            const shippingOptions = await shippingZoneRepository.getOptions(
                shippingOptionParams.shippingZoneId
            );

            expect(shippingOptions.length).toBeGreaterThan(0);
            for (const shippingOption of shippingOptions) {
                if (shippingOption.id === shippingOptionParams.id) {
                    expect(shippingOption).not.toBeNull();
                    expect(shippingOption.shippingZoneId).toEqual(
                        shippingOptionParams.shippingZoneId
                    );
                    expect(shippingOption.name).toEqual(
                        shippingOptionParams.name
                    );
                    expect(shippingOption.additionalDetails).toEqual(
                        shippingOptionParams.additionalDetails
                    );
                    expect(shippingOption.price).toEqual(
                        shippingOptionParams.price
                    );
                    expect(shippingOption.isEnabled).toEqual(
                        shippingOptionParams.isEnabled
                    );
                }
            }
        }, 60000);

        it('Should delete a shipping option', async () => {
            const { id } = shippingOptionParams;
            const shippingOption = await shippingZoneRepository.deleteOption(
                shippingOptionParams
            );

            expect(shippingOption).not.toBeNull();
            expect(shippingOption.id).toEqual(id);
            expect(shippingOption.name).toEqual(shippingOptionParams.name);
            expect(shippingOption.additionalDetails).toEqual(
                shippingOptionParams.additionalDetails
            );
            expect(shippingOption.price).toEqual(shippingOptionParams.price);
            expect(shippingOption.isEnabled).toEqual(
                shippingOptionParams.isEnabled
            );
        }, 60000);

        it('Should delete a shipping zone by id', async () => {
            const { id, name, path, isEnabled } = params;
            const shippingZone = await shippingZoneRepository.delete(id);

            expect(shippingZone).not.toBeNull();
            expect(shippingZone.id).toEqual(id);
            expect(shippingZone.storeId).toEqual(storeId);
            expect(shippingZone.name).toEqual(name);
            expect(shippingZone.path).toEqual(path);
            expect(shippingZone.isEnabled).toEqual(isEnabled);
        }, 60000);

        afterAll(async () => {
            await closeConnection();
        });
    });
});
