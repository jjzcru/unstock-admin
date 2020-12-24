export interface EmailService {
    sendEmail(params: SendEmailParams): Promise<boolean>;
}

export interface SendEmailParams {
    email: string;
    subject: string;
    body: string;
    name?: string;
}
