import { EmailDataService } from '../../../data/services/EmailDataService';

describe.skip('EmailDataService', () => {
    let emailService: EmailDataService;
    beforeAll(() => {
        emailService = new EmailDataService();
    });
    describe('#sendEmail', () => {
        it('Should send an email', async () => {
            const email = '';
            const subject = 'Test Email';
            const body = '';
            const response = await emailService.sendEmail({
                email,
                subject,
                body,
            });
            expect(response).toBe(true);
        });
    });
});
