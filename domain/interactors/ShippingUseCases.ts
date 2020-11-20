import { UseCase } from './UseCase';
import {
    PickupLocationRepository,
    ShippingZoneRepository,
} from '../repository/ShippingRepository';
import { PickupLocation, PickupLocationOption } from '../model/PickupLocation';
import { ShippingOption, ShippingZone } from '../model/Shipping';
import { throwError } from '@errors';
import {
    PickupLocationDataRepository,
    ShippingZoneDataRepository,
} from '@data/db/ShippingDataRepository';

export class AddPickupLocation implements UseCase {
    private pickupLocation: PickupLocation;
    private repository: PickupLocationRepository;

    constructor(
        pickupLocation: PickupLocation,
        repository: PickupLocationRepository = new PickupLocationDataRepository()
    ) {
        this.pickupLocation = pickupLocation;
        this.repository = repository;
    }

    async execute(): Promise<PickupLocation> {
        return this.repository.add(this.pickupLocation);
    }
}

export class UpdatePickupLocation implements UseCase {
    private pickupLocation: PickupLocation;
    private repository: PickupLocationRepository;

    constructor(
        pickupLocation: PickupLocation,
        repository: PickupLocationRepository = new PickupLocationDataRepository()
    ) {
        this.pickupLocation = pickupLocation;
        this.repository = repository;
    }

    async execute(): Promise<PickupLocation> {
        return this.repository.update(this.pickupLocation);
    }
}

export class DeletePickupLocation implements UseCase {
    private id: string;
    private repository: PickupLocationRepository;

    constructor(
        id: string,
        repository: PickupLocationRepository = new PickupLocationDataRepository()
    ) {
        this.id = id;
        this.repository = repository;
    }

    async execute(): Promise<PickupLocation> {
        return this.repository.delete(this.id);
    }
}

export class GetPickupLocation implements UseCase {
    private id: string;
    private repository: PickupLocationRepository;

    constructor(
        id: string,
        repository: PickupLocationRepository = new PickupLocationDataRepository()
    ) {
        this.id = id;
        this.repository = repository;
    }

    async execute(): Promise<PickupLocation> {
        return this.repository.getByID(this.id);
    }
}

export class GetPickupLocations implements UseCase {
    private storeId: string;
    private repository: PickupLocationRepository;

    constructor(
        storeId: string,
        repository: PickupLocationRepository = new PickupLocationDataRepository()
    ) {
        this.storeId = storeId;
        this.repository = repository;
    }

    async execute(): Promise<PickupLocation[]> {
        return this.repository.get(this.storeId);
    }
}

export class AddPickupLocationOption implements UseCase {
    private pickupLocationOption: PickupLocationOption;
    private repository: PickupLocationRepository;

    constructor(
        pickupLocationOption: PickupLocationOption,
        repository: PickupLocationRepository = new PickupLocationDataRepository()
    ) {
        this.pickupLocationOption = pickupLocationOption;
        this.repository = repository;
    }

    async execute(): Promise<PickupLocationOption> {
        return this.repository.addOption(this.pickupLocationOption);
    }
}

export class GetPickupLocationOptions implements UseCase {
    private id: string;
    private repository: PickupLocationRepository;

    constructor(
        id: string,
        repository: PickupLocationRepository = new PickupLocationDataRepository()
    ) {
        this.id = id;
        this.repository = repository;
    }

    async execute(): Promise<PickupLocationOption[]> {
        return this.repository.getOptions(this.id);
    }
}

export class DeletePickupLocationOption implements UseCase {
    private pickupLocationOption: PickupLocationOption;
    private repository: PickupLocationRepository;

    constructor(
        pickupLocationOption: PickupLocationOption,
        repository: PickupLocationRepository = new PickupLocationDataRepository()
    ) {
        this.pickupLocationOption = pickupLocationOption;
        this.repository = repository;
    }

    async execute(): Promise<PickupLocationOption> {
        return this.repository.deleteOption(this.pickupLocationOption);
    }
}

/****************************************************/

export class AddShippingZone implements UseCase {
    private shippingZone: ShippingZone;
    private repository: ShippingZoneRepository;

    constructor(
        shippingZone: ShippingZone,
        repository: ShippingZoneRepository = new ShippingZoneDataRepository()
    ) {
        this.shippingZone = shippingZone;
        this.repository = repository;
    }

    async execute(): Promise<ShippingZone> {
        return this.repository.add(this.shippingZone);
    }
}

export class UpdateShippingZone implements UseCase {
    private shippingZone: ShippingZone;
    private repository: ShippingZoneRepository;

    constructor(
        shippingZone: ShippingZone,
        repository: ShippingZoneRepository = new ShippingZoneDataRepository()
    ) {
        this.shippingZone = shippingZone;
        this.repository = repository;
    }

    async execute(): Promise<ShippingZone> {
        return this.repository.update(this.shippingZone);
    }
}

export class DeleteShippingZone implements UseCase {
    private id: string;
    private repository: ShippingZoneRepository;

    constructor(
        id: string,
        repository: ShippingZoneRepository = new ShippingZoneDataRepository()
    ) {
        this.id = id;
        this.repository = repository;
    }

    async execute(): Promise<ShippingZone> {
        return this.repository.delete(this.id);
    }
}

export class GetShippingZone implements UseCase {
    private id: string;
    private repository: ShippingZoneRepository;

    constructor(
        id: string,
        repository: ShippingZoneRepository = new ShippingZoneDataRepository()
    ) {
        this.id = id;
        this.repository = repository;
    }

    async execute(): Promise<ShippingZone> {
        return this.repository.getByID(this.id);
    }
}

export class GetShippingZones implements UseCase {
    private storeId: string;
    private repository: ShippingZoneRepository;

    constructor(
        storeId: string,
        repository: ShippingZoneRepository = new ShippingZoneDataRepository()
    ) {
        this.storeId = storeId;
        this.repository = repository;
    }

    async execute(): Promise<ShippingZone[]> {
        return this.repository.get(this.storeId);
    }
}

export class AddShippingOption implements UseCase {
    private shippingOption: ShippingOption;
    private repository: ShippingZoneRepository;

    constructor(
        shippingOption: ShippingOption,
        repository: ShippingZoneRepository = new ShippingZoneDataRepository()
    ) {
        this.shippingOption = shippingOption;
        this.repository = repository;
    }

    async execute(): Promise<ShippingOption> {
        return this.repository.addOption(this.shippingOption);
    }
}

export class UpdateShippingOption implements UseCase {
    private shippingOption: ShippingOption;
    private repository: ShippingZoneRepository;

    constructor(
        shippingOption: ShippingOption,
        repository: ShippingZoneRepository = new ShippingZoneDataRepository()
    ) {
        this.shippingOption = shippingOption;
        this.repository = repository;
    }

    async execute(): Promise<ShippingOption> {
        return this.repository.addOption(this.shippingOption);
    }
}

export class GetShippingOptions implements UseCase {
    private zoneId: string;
    private repository: ShippingZoneRepository;

    constructor(
        zoneId: string,
        repository: ShippingZoneRepository = new ShippingZoneDataRepository()
    ) {
        this.zoneId = zoneId;
        this.repository = repository;
    }

    async execute(): Promise<ShippingOption[]> {
        return this.repository.getOptions(this.zoneId);
    }
}

export class DeleteShippingOption implements UseCase {
    private shippingOption: ShippingOption;
    private repository: ShippingZoneRepository;

    constructor(
        shippingOption: ShippingOption,
        repository: ShippingZoneRepository = new ShippingZoneDataRepository()
    ) {
        this.shippingOption = shippingOption;
        this.repository = repository;
    }

    async execute(): Promise<ShippingOption> {
        return this.repository.deleteOption(this.shippingOption);
    }
}
