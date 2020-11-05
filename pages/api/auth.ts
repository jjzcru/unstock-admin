import { proxyRequest } from '@utils/request';
import validator from 'validator';
import * as jwt from 'jsonwebtoken';
import moment from 'moment';

export default async (req: any, res: any) => {
    switch (req.method) {
        case 'POST':
            await proxyRequest(req, res, AuthRequest);
            break;
        default:
            res.status(404).send({ error: 'Not found' });
    }
};

async function AuthRequest(req: any, res: any) {
    const { email } = req.body;

    res.send(true);
}

async function Auth(req: any, res: any) {
    const { email } = req.body;

    res.send(true);
}

export async function decodeToken(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const cb = async (err: any, decoded: any) => {
            if (err) {
                reject(err);
                return;
            }

            try {
                resolve({
                    id: decoded.id,
                });
            } catch (e) {
                reject(e);
            }
        };

        try {
            jwt.verify(token, process.env.JWT_SECRET, cb);
        } catch (e) {
            reject(e);
        }
    });
}

export function getSignedToken(costumer: Costumer): any {
    const payload: any = {
        id: costumer.id,
    };

    let token: string;
    const dateAmount = 7;
    const dateUnit = 'd';
    const expiresIn = `${dateAmount}${dateUnit}`;

    token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });

    const expiredAt = moment(new Date()).add(dateAmount, dateUnit).toDate();

    // Sign with secret
    return {
        token,
        expiredAt,
    };
}
