import {
    EmailService,
    SendEmailParams,
} from '../../domain/service/EmailService';

import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export class EmailDataService implements EmailService {
    async sendEmail(params: SendEmailParams): Promise<boolean> {
        const { email, subject, body } = params;
        if (!email || !subject || !body) {
            throw new Error('Missing email, subject or body');
        }

        const msg = {
            to: email,
            from: process.env.SENDGRID_SENDER || 'josejuan2412@hotmail.com',
            subject,
            html: body,
        };

        return new Promise((resolve, reject) => {
            sgMail.send(msg, (err) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(true);
            });
        });
    }
}
