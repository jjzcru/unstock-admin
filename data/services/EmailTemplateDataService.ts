import mjml2html from 'mjml';
import Mustache from 'mustache';
import ejs from 'ejs';
// import { Locale } from '../../locales';
import language from 'lang';
import {
    authTemplate,
    markAsPaid,
    closeOrder,
    cancelOrderTemplate,
    newOrderTemplate,
} from './templates/templates';
import {
    EmailTemplateService,
    AuthTemplateParams,
    CancelOrderParams,
    MarkAsPaidTemplateParams,
    CloseOrderTemplateParams,
    NewOrderParams,
} from '../../domain/service/EmailTemplateService';

export class EmailTemplateDataService implements EmailTemplateService {
    async getAuthTemplate(params: AuthTemplateParams): Promise<string> {
        const { lang, name, code, theme } = params;
        const locale = language['es'];
        const intro = Mustache.render(locale['AUTH_STORE_INTRO'], {
            name,
        });
        const message = locale['AUTH_STORE_MESSAGE'];

        const mjmlBody = ejs.render(authTemplate, {
            logo: /* theme?.logo  || */ '',
            accent: /* theme?.accent || */ '#000',
            intro,
            message,
            code,
        });

        const body = mjml2html(mjmlBody);

        return body.html;
    }
    async newOrderTemplate(params: NewOrderParams): Promise<string> {
        const {
            lang,
            orderNumber,
            costumer,
            address,
            items,
            total,
            paymentMethod,
        } = params;

        const locale = language['es'];
        const title = 'Nueva orden'; // locale['ORDER_NOTIFICATION_CANCELLATION_TITLE'];

        const titles = {
            contact: locale['ORDER_NOTIFICATION_CONTACT_INFORMATION'],
            name: locale['ORDER_NOTIFICATION_CONTACT_INFORMATION_FIRST_NAME'],
            lastName:
                locale['ORDER_NOTIFICATION_CONTACT_INFORMATION_LAST_NAME'],
            email: locale['ORDER_NOTIFICATION_CONTACT_INFORMATION_EMAIL'],
            phone: locale['ORDER_NOTIFICATION_CONTACT_INFORMATION_PHONE'],
            shippingAddress:
                locale['ORDER_NOTIFICATION_SHIPPING_ADDRESS_TITLE'],
            address: locale['ORDER_NOTIFICATION_SHIPPING_ADDRESS'],
            city: locale['ORDER_NOTIFICATION_SHIPPING_CITY'],
            province: locale['ORDER_NOTIFICATION_SHIPPING_PROVINCE'],
            deliveryInstructions:
                locale['ORDER_NOTIFICATION_SHIPPING_DELIVERY_INSTRUCTIONS'],
            pickupLocation: locale['ORDER_NOTIFICATION_PICKUP_LOCATION_TITLE'],
            pickupLocationName:
                locale['ORDER_NOTIFICATION_PICKUP_LOCATION_NAME'],
            additionalDetails:
                locale['ORDER_NOTIFICATION_PICKUP_LOCATION_ADDITIONAL_DETAILS'],
            items: locale['ORDER_ITEMS_TITLE'],
            product: locale['PRODUCT'],
            option: locale['OPTION'],
            quantity: locale['QUANTITY'],
            total: locale['TOTAL'],
            paymentMethod: locale['ORDER_NOTIFICATION_PAYMENT_METHOD'],
            paymentInstructions:
                locale[
                'ORDER_NOTIFICATION_PAYMENT_METHOD_PAYMENT_INSTRUCTIONS'
                ],
            message:
                'Nueva orden generada, estos son los detalles de tu orden:',
        };

        const mjmlBody = ejs.render(newOrderTemplate, {
            title,
            orderNumber,
            costumer,
            titles,
            address,
            paymentMethod,
            items,
            total: total.toFixed(2),
        });

        const body = mjml2html(mjmlBody);

        return body.html;
    }

    async cancelledOrderTemplate(params: CancelOrderParams): Promise<string> {
        const {
            lang,
            orderNumber,
            costumer,
            address,
            items,
            total,
            paymentMethod,
        } = params;
        const locale = language['es'];
        const title = locale['ORDER_NOTIFICATION_CANCELLATION_TITLE'];

        const titles = {
            contact: locale['ORDER_NOTIFICATION_CONTACT_INFORMATION'],
            name: locale['ORDER_NOTIFICATION_CONTACT_INFORMATION_FIRST_NAME'],
            lastName:
                locale['ORDER_NOTIFICATION_CONTACT_INFORMATION_LAST_NAME'],
            email: locale['ORDER_NOTIFICATION_CONTACT_INFORMATION_EMAIL'],
            phone: locale['ORDER_NOTIFICATION_CONTACT_INFORMATION_PHONE'],
            shippingAddress:
                locale['ORDER_NOTIFICATION_SHIPPING_ADDRESS_TITLE'],
            address: locale['ORDER_NOTIFICATION_SHIPPING_ADDRESS'],
            city: locale['ORDER_NOTIFICATION_SHIPPING_CITY'],
            province: locale['ORDER_NOTIFICATION_SHIPPING_PROVINCE'],
            deliveryInstructions:
                locale['ORDER_NOTIFICATION_SHIPPING_DELIVERY_INSTRUCTIONS'],
            pickupLocation: locale['ORDER_NOTIFICATION_PICKUP_LOCATION_TITLE'],
            pickupLocationName:
                locale['ORDER_NOTIFICATION_PICKUP_LOCATION_NAME'],
            additionalDetails:
                locale['ORDER_NOTIFICATION_PICKUP_LOCATION_ADDITIONAL_DETAILS'],
            items: locale['ORDER_ITEMS_TITLE'],
            product: locale['PRODUCT'],
            option: locale['OPTION'],
            quantity: locale['QUANTITY'],
            total: locale['TOTAL'],
            paymentMethod: locale['ORDER_NOTIFICATION_PAYMENT_METHOD'],
            paymentInstructions:
                locale[
                'ORDER_NOTIFICATION_PAYMENT_METHOD_PAYMENT_INSTRUCTIONS'
                ],
            message: locale['EMAIL_CANCELLED_ORDER'],
        };

        const mjmlBody = ejs.render(cancelOrderTemplate, {
            title,
            orderNumber,
            costumer,
            titles,
            address,
            paymentMethod,
            items,
            total: total.toFixed(2),
        });

        const body = mjml2html(mjmlBody);

        return body.html;
    }

    async markAsPaidTemplate(
        params: MarkAsPaidTemplateParams
    ): Promise<string> {
        const { lang, name, order, theme, domain } = params;
        const locale = language['es'];

        const titles = {
            order: locale['ORDER'],
            message: locale['EMAIL_PAID_ORDER'],
        };

        const mjmlBody = ejs.render(markAsPaid, {
            titles,
            order,
            name,
            domain,
        });

        const body = mjml2html(mjmlBody);
        return body.html;
    }

    async closeOrderTemplate(
        params: CloseOrderTemplateParams
    ): Promise<string> {
        const { lang, name, order, theme, domain } = params;
        const locale = language['es'];

        const titles = {
            order: locale['ORDER'],
            message: locale['EMAIL_CLOSED_ORDER'],
        };

        const mjmlBody = ejs.render(closeOrder, {
            titles,
            order,
            name,
            domain,
        });

        const body = mjml2html(mjmlBody);
        return body.html;
    }
}
