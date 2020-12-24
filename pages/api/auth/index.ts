// import { proxyRequest } from '@utils/request';
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
        case 'PUT':
            await Auth(req, res);
            break;
        default:
            res.status(404).send({ error: 'Not found' });
    }
};

async function AuthRequest(req: any, res: any) {
    try {
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

        console.log(`EMAIL: ${email}`);
        console.log(`DOMAIN: ${domain}`);

        const useCase = new GetAuthRequest({ email, domain });
        await useCase.execute();
        res.send(true);
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
}

async function Auth(req: any, res: any) {
    const { email, domain, code } = req.body;
    const useCase = new ValidateAuthRequest({ email, domain, code });
    const AuthConfirmation = await useCase.execute();
    res.send(AuthConfirmation);
}
