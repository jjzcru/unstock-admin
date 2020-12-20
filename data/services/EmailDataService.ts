import nodemailer from 'nodemailer';

import {
    EmailService,
    SendEmailParams,
} from '../../domain/service/EmailService';

export class EmailDataService implements EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        if (!process.env.EMAIL_SENDER) {
            throw new Error('Env variable EMAIL_SENDER is not set');
        }
        if (!process.env.EMAIL_SERVICE_CLIENT) {
            throw new Error('Env variable EMAIL_SERVICE_CLIENT is not set');
        }
        if (!process.env.EMAIL_PRIVATE_KEY) {
            throw new Error('Env variable EMAIL_PRIVATE_KEY is not set');
        }

        const transport: any = {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL_SENDER,
                serviceClient: process.env.EMAIL_SERVICE_CLIENT,
                privateKey: process.env.EMAIL_PRIVATE_KEY.replace(/\\n/g, '\n'),
            },
        };
        this.transporter = nodemailer.createTransport(transport);
    }

    async sendEmail(params: SendEmailParams): Promise<boolean> {
        const { email, subject, body, name } = params;
        if (!email || !subject || !body) {
            throw new Error('Missing email, subject or body');
        }

        const senderName = name || 'no-reply';
        const message: nodemailer.SendMailOptions = {
            from: `"${senderName}" <${process.env.EMAIL_SENDER}>`, // sender address
            to: email,
            subject,
            html: body,
        };
        await this.transporter.sendMail(message);

        return true;
    }
}
