import * as AWS from 'aws-sdk';

import {
	EmailService,
	SendEmailParams,
} from '../../domain/service/EmailService';

export class EmailDataService implements EmailService {
	private senderEmail: string;
	private config: any;

	constructor() {
		if (!process.env.SES_ACCESS_KEY) {
			throw new Error('Env variable SES_ACCESS_KEY is not set');
		}
		if (!process.env.SES_SECRET_KEY) {
			throw new Error('Env variable SES_SECRET_KEY is not set');
		}
		if (!process.env.SES_REGION) {
			throw new Error('Env variable SES_REGION is not set');
		}
		if (!process.env.SES_SENDER_EMAIL) {
			throw new Error('Env variable SES_SENDER_EMAIL is not set');
		}

		this.config = {
			accessKeyId: process.env.SES_ACCESS_KEY,
			secretAccessKey: process.env.SES_SECRET_KEY,
			region: process.env.SES_REGION,
		};

		this.senderEmail = process.env.SES_SENDER_EMAIL;
	}
	async sendEmail(params: SendEmailParams): Promise<boolean> {
		const { email, subject, body } = params;
		if (!email || !subject || !body) {
			throw new Error('Missing email, subject or body');
		}

		const inqParams = this.createInquiryParamsConfig(email, subject, body);
		const ses = new AWS.SES(this.config);

		return new Promise((resolve, reject) => {
			ses.sendEmail(inqParams, (err) => {
				if (err) {
					reject(err);
					return;
				}

				resolve(true);
			});
		});
	}

	createInquiryParamsConfig(email: string, subject: string, body: string) {
		const params: any = {
			Destination: {
				BccAddresses: [],
				CcAddresses: [],
				ToAddresses: [email],
			},
			Message: {
				Body: {
					Html: {
						Data: body,
						Charset: 'UTF-8',
					},
				},
				Subject: {
					Data: subject,
					Charset: 'UTF-8',
				},
			},
			Source: this.senderEmail,
			ReplyToAddresses: [this.senderEmail],
			ReturnPath: this.senderEmail,
		};
		return params;
	}
}
