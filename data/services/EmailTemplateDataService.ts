import mjml2html from 'mjml';
import Mustache from 'mustache';
import ejs from 'ejs';
// import { Locale } from '../../locales';
import language from 'lang';
import {
    authTemplate,
    orderShippingUpdateTemplate,
    markAsPaid,
    closeOrder,
} from './templates/templates';
import {
    EmailTemplateService,
    AuthTemplateParams,
    NotificationOrderParams,
    MarkAsPaidTemplateParams,
    CloseOrderTemplateParams,
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

    async getNotificationClientOrderUpdateTemplate(
        params: NotificationOrderParams
    ): Promise<string> {
        const {
            orderId,
            lang,
            orderNumber,
            costumer,
            address,
            location,
            shippingType,
            pickupLocation,
            items,
            total,
            paymentMethod,
        } = params;
        const locale = language['es'];
        const url =
            process.env.APP_ENV === 'production'
                ? `https://admin.unstock.app/orders/${orderId}`
                : `https://admin.dev.unstock.app/orders/${orderId}`;
        const title = locale.getKey('ORDER_NOTIFICATION_CLIENT_TITLE');

        const titles = {
            contact: locale.getKey('ORDER_NOTIFICATION_CONTACT_INFORMATION'),
            name: locale.getKey(
                'ORDER_NOTIFICATION_CONTACT_INFORMATION_FIRST_NAME'
            ),
            lastName: locale.getKey(
                'ORDER_NOTIFICATION_CONTACT_INFORMATION_LAST_NAME'
            ),
            email: locale.getKey(
                'ORDER_NOTIFICATION_CONTACT_INFORMATION_EMAIL'
            ),
            phone: locale.getKey(
                'ORDER_NOTIFICATION_CONTACT_INFORMATION_PHONE'
            ),
            shippingAddress: locale.getKey(
                'ORDER_NOTIFICATION_SHIPPING_ADDRESS_TITLE'
            ),
            address: locale.getKey('ORDER_NOTIFICATION_SHIPPING_ADDRESS'),
            city: locale.getKey('ORDER_NOTIFICATION_SHIPPING_CITY'),
            province: locale.getKey('ORDER_NOTIFICATION_SHIPPING_PROVINCE'),
            deliveryInstructions: locale.getKey(
                'ORDER_NOTIFICATION_SHIPPING_DELIVERY_INSTRUCTIONS'
            ),
            pickupLocation: locale.getKey(
                'ORDER_NOTIFICATION_PICKUP_LOCATION_TITLE'
            ),
            pickupLocationName: locale.getKey(
                'ORDER_NOTIFICATION_PICKUP_LOCATION_NAME'
            ),
            additionalDetails: locale.getKey(
                'ORDER_NOTIFICATION_PICKUP_LOCATION_ADDITIONAL_DETAILS'
            ),
            items: locale.getKey('ORDER_ITEMS_TITLE'),
            product: locale.getKey('PRODUCT'),
            option: locale.getKey('OPTION'),
            quantity: locale.getKey('QUANTITY'),
            total: locale.getKey('TOTAL'),
            paymentMethod: locale.getKey('ORDER_NOTIFICATION_PAYMENT_METHOD'),
            paymentInstructions: locale.getKey(
                'ORDER_NOTIFICATION_PAYMENT_METHOD_PAYMENT_INSTRUCTIONS'
            ),
        };

        const mjmlBody = ejs.render(orderShippingUpdateTemplate, {
            title,
            orderNumber,
            url,
            costumer,
            titles,
            address,
            location,
            shippingType,
            pickupLocation,
            paymentMethod,
            items,
            total,
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
