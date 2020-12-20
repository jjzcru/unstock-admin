import { closeConnection, runQuery } from '@data/db/db';
import { GetAuthRequest } from '@domain/interactors/UserUseCases';

describe('UserUseCases', () => {
    describe.only('GetAuthRequest', () => {
        const domain: string = 'zenhome.unstock.shop';
        const email: string = 'josejuan2412@gmail.com';

        it('Should create confirmation code', async () => {
            const params: any = {
                email,
                domain,
                type: 'admin',
            };

            const useCase = new GetAuthRequest(params);
            const response = await useCase.execute();

            console.log(response);
        });
    });
});
