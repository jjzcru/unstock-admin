import React, { useState } from 'react';
import { csrfToken } from 'next-auth/client';
import styles from './Auth.module.css';

import { Card, Divider, Toast } from '@geist-ui/react';

export default function SignIn({ csrfToken }) {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [domain, setDomain] = useState('');

    const createRequest = async (email, domain) => {
        const res = await fetch('/api/auth', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email, domain: domain }),
        });
        return await res.json();
    };

    const onSend = async (email, domain) => {
        // const authRequest = await createRequest(email, domain);
        createRequest(email, domain)
            .then((res) => {
                if (res.error) {
                    console.log(res);
                    alert(
                        'Error de autenticación, verifique sus credenciales e intentelo nuevamente.'
                    );
                } else {
                    setEmail(email);
                    setDomain(domain);
                    setStep(2);
                }
            })
            .catch((error) => {
                console.log('AQUI VA EL ERROR');
                console.log(error);
            });
    };

    return step === 1 ? (
        <Step1 onSend={onSend} />
    ) : (
        <Step2 email={email} domain={domain} csrfToken={csrfToken} />
    );
}

function Step1({ onSend }) {
    const [email, setEmail] = useState('');
    const [domain, setDomain] = useState('');
    return (
        <div className={styles['grid-container']}>
            <div>
                <Card width="90%" shadow>
                    <Card.Content>
                        <h4>Unstock Admin</h4>
                    </Card.Content>
                    <Divider y={0} />
                    <Card.Content>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                onSend(email, domain);
                            }}
                        >
                            <div style={{ marginRight: '20px' }}>
                                <label style={{ display: 'block' }}>
                                    Email
                                    <input
                                        style={{ display: 'block' }}
                                        name="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                        }}
                                        required
                                    />
                                </label>
                            </div>

                            <br />
                            <div style={{ marginRight: '20px' }}>
                                <label style={{ display: 'block' }}>
                                    Domain
                                    <input
                                        style={{ display: 'block' }}
                                        name="domain"
                                        type="text"
                                        onChange={(e) => {
                                            setDomain(e.target.value);
                                        }}
                                        required
                                    />
                                </label>
                            </div>

                            <br />
                            <br />
                            <br />
                            <button type="submit">Iniciar Sesion</button>
                        </form>
                    </Card.Content>
                </Card>
            </div>
        </div>
    );
}

function Step2({ csrfToken, email, domain }) {
    return (
        <div className={styles['grid-container']}>
            <div>
                <Card width="90%" shadow>
                    <Card.Content>
                        <h4>Unstock Admin</h4>
                    </Card.Content>
                    <Divider y={0} />
                    <Card.Content>
                        <form
                            method="post"
                            action="/api/auth/callback/credentials"
                        >
                            <input
                                name="csrfToken"
                                type="hidden"
                                defaultValue={csrfToken}
                            />
                            <input
                                name="email"
                                type="hidden"
                                defaultValue={email}
                            />
                            <input
                                name="domain"
                                type="hidden"
                                defaultValue={domain}
                            />
                            <div style={{ marginRight: '20px' }}>
                                <label style={{ display: 'block' }}>
                                    Codigo de Confirmación
                                    <input
                                        name="code"
                                        minLength="6"
                                        maxLength="6"
                                        type="number"
                                        style={{ display: 'block' }}
                                    />
                                </label>
                            </div>
                            <br />
                            <button type="submit">Validar</button>
                        </form>
                    </Card.Content>
                </Card>
            </div>
        </div>
    );
}

SignIn.getInitialProps = async (context) => {
    return {
        csrfToken: await csrfToken(context),
    };
};
