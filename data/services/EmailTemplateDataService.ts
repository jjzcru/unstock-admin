import mjml2html from 'mjml';
import Mustache from 'mustache';
import ejs from 'ejs';
// import { Locale } from '../../locales';
import language from 'lang';
import { authTemplate } from './templates/templates';
import {
    EmailTemplateService,
    AuthTemplateParams,
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
}
