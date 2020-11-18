import { closeConnection } from '@data/db/db';
import {
    PickupLocation,
    PickupLocationOption,
} from '@domain/model/PickupLocation';
import { PickupLocationRepository } from '@domain/repository/PickupLocationRepository';
import PickupLocationDataRepository from '@data/db/PickupLocationDataRepository';

describe.only('PickupLocationDataRepository', () => {
    let pickupLocationRepository: PickupLocationRepository;
    const storeId: string = '04c4315e-c73f-49a6-acbf-cf91a07996e3';
    const paymentMethodId: string = '1baf3aaf-f4dc-40c4-838e-e6931193184b';

    const params: PickupLocation = {
        storeId,
        latitude: 5.423522,
        longitude: -80.144084,
        name: 'Test',
        additionalDetails: 'test',
    };

    const pickupLocationOptionParams: PickupLocationOption = {
        storePaymentMethodId: paymentMethodId,
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
        const pickupLocation = await pickupLocationRepository.getByID(
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

        const pickupLocation = await pickupLocationRepository.update(params);
        expect(pickupLocation).not.toBeNull();
        pickupLocationOptionParams.storePickupLocationId = pickupLocation.id;
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
        pickupLocationOptionParams.storePickupLocationId =
            pickupLocationOption.storePickupLocationId;
        expect(pickupLocationOption.storePaymentMethodId).toEqual(
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
                expect(pickupLocationOption.storePickupLocationId).toEqual(
                    pickupLocationOptionParams.storePickupLocationId
                );
                expect(pickupLocationOption.storePaymentMethodId).toEqual(
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
        expect(pickupLocationOption.id).toEqual(pickupLocationOptionParams.id);
        pickupLocationOptionParams.id = pickupLocationOption.id;
        expect(pickupLocationOption.storePickupLocationId).toEqual(
            pickupLocationOptionParams.storePickupLocationId
        );
        expect(pickupLocationOption.storePaymentMethodId).toEqual(
            paymentMethodId
        );
    }, 60000);

    it('Should delete a pickup location by id', async () => {
        const pickupLocation = await pickupLocationRepository.delete(params.id);
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
