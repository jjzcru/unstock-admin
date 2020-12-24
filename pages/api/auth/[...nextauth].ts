import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';

import { ValidateAuthRequest } from '@domain/interactors/UserUseCases';

const options = {
    // Configure one or more authentication providers
    providers: [
        Providers.Credentials({
            // The name to display on the sign in form (e.g. 'Sign in with...')
            name: 'Credentials',
            // The credentials is used to generate a suitable form on the sign in page.
            // You can specify whatever fields you are expecting to be submitted.
            // e.g. domain, username, password, 2FA token, etc.
            credentials: {
                email: {
                    label: 'email',
                    type: 'email',
                    placeholder: 'email',
                },
                domain: {
                    label: 'Domain',
                    type: 'text ',
                    placeholder: '',
                },
                code: { label: 'Code', type: 'number' },
            },
            authorize: async (credentials) => {
                const { email, domain, code } = credentials;

                const useCase = new ValidateAuthRequest({
                    email,
                    domain,
                    code,
                });
                try {
                    const auth = await useCase.execute();
                    if (auth) {
                        const user = {
                            name: auth.name,
                            email,
                            image: {
                                id: auth.id,
                                storeId: auth.storeId,
                                storeName: auth.storeName,
                                name: auth.name,
                                email,
                                domain,
                                type: auth.type,
                            },
                        };
                        return Promise.resolve(user);
                    }

                    return null;
                } catch (e) {
                    return Promise.reject(e);
                }
            },
        }),
    ],
    session: {
        jwt: true,
    },
    pages: {
        signIn: '/auth/login',
        signOut: '/auth/signout',
        error: '/auth/error', // Error code passed in query string as ?error=
        verifyRequest: '/auth/verify-request', // (used for check email message)
        newUser: null, // If set, new users will be directed here on first sign in
    },
};

export default (req, res) => NextAuth(req, res, options);
