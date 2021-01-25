import { Costumer } from 'domain/model/Costumer';
import { Address, Location } from 'domain/model/Order';
import { PaymentMethod } from 'domain/model/Payment';
import { PickupLocation } from 'domain/model/PickupLocation';

export interface EmailTemplateService {
    getAuthTemplate(params: AuthTemplateParams): Promise<string>;
}

export interface AuthTemplateParams {
    lang: string;
    name: string;
    code: number;
    theme: any;
}

export interface NotificationOrderParams {
    orderId: string;
    lang: string;
    orderNumber: number;
    costumer: Costumer;
    shippingType: 'shipment' | 'pickup';
    address?: Address;
    location?: Location;
    pickupLocation?: PickupLocation;
    paymentMethod: PaymentMethod;
    items: {
        name: string;
        option1: string;
        option2: string;
        option3: string;
        quantity: number;
        total: number;
    }[];
    total: number;
}
