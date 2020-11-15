import { proxyRequest } from '@utils/request';
import { throwError } from '@errors';
import {
    GetAuthRequest,
    ValidateAuthRequest,
} from '@domain/interactors/UserUseCases';

export default async (req: any, res: any) => {
    switch (req.method) {
        case 'POST':
            await AuthRequest(req, res);
            break;
        default:
            res.status(404).send({ error: 'Not found' });
    }
};

async function AuthRequest(req: any, res: any) {
    const { email, domain } = req.body;
    if (
        email === null ||
        email === undefined ||
        email.length === 0 ||
        domain === null ||
        domain === undefined ||
        domain.length === 0
    ) {
        throwError('MISSING_ARGUMENTS');
    }
    const useCase = new GetAuthRequest({ email, domain });
    await useCase.execute();
    res.send(true);
}

// async function Auth(req: any, res: any) {
//     const { email, domain, code } = req.body;
//     const useCase = new ValidateAuthRequest({ email, domain, code });
//     const Auth = await useCase.execute();
//     res.send(true);
// }
