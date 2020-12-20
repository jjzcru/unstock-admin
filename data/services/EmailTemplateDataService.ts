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
        console.log(language);
        const { lang, name, code, theme } = params;
        const intro = '';
        const message = '';

        // const intro = Mustache.render(locale.getKey('AUTH_STORE_INTRO'), {
        //     name,
        // });

        //  const message = locale.getKey('AUTH_STORE_MESSAGE');

        const mjmlBody = ejs.render(authTemplate, {
            logo: theme?.logo || '',
            accent: theme?.accent || '#3d3d3d',
            intro,
            message,
            code,
        });

        const body = mjml2html(mjmlBody);

        return body.html;
    }
}
