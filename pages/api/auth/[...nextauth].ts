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
                const user = async () => {
                    // You need to provide your own logic here that takes the credentials
                    // submitted and returns either a object representing a user or value
                    // that is false/null if the credentials are invalid.
                    // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
                    // console.clear();
                    const { email, domain, code } = credentials;

                    const useCase = new ValidateAuthRequest({
                        email,
                        domain,
                        code,
                    });
                    try {
                        const Auth = await useCase.execute();
                        const response = {
                            id: 1,
                            domain,
                            email,
                            storeId: 'STORE ID',
                            name: Auth.name,
                            storeName: 'HERE STORE NAME',
                        };
                        return response;
                    } catch (e) {
                        console.log(e.message);
                        throw e;
                    }

                    // if (`${code}` === `1234`) {
                    //     throw new Error(`SHIT HAPPENS`);
                    // }
                };
                if (user) {
                    // Any user object returned here will be saved in the JSON Web Token
                    return Promise.resolve(user());
                } else {
                    return Promise.resolve(null);
                }
            },
        }),
    ],
    pages: {
        signIn: '/auth/login',
        signOut: '/auth/signout',
        error: '/auth/error', // Error code passed in query string as ?error=
        verifyRequest: '/auth/verify-request', // (used for check email message)
        newUser: null, // If set, new users will be directed here on first sign in
    },

    // A database is optional, but required to persist accounts in a database
    database: process.env.DATABASE_URL,
};

export default (req, res) => NextAuth(req, res, options);
