import React, { useState } from 'react';
import { csrfToken } from 'next-auth/client';

export default function SignIn({ csrfToken }) {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [domain, setDomain] = useState('');

    const onSend = (email, domain) => {
        setEmail(email);
        setDomain(domain);
        setStep(2);
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
        <div>
            <form
                method="post"
                onSubmit={() => {
                    onSend(email, domain);
                }}
            >
                <label>
                    Email
                    <input
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                        }}
                    />
                </label>
                <br />
                <label>
                    Domain
                    <input
                        name="domain"
                        type="text"
                        onChange={(e) => {
                            setDomain(e.target.value);
                        }}
                    />
                </label>
                <br />
                <br />
                <button type="submit">Sign in</button>
            </form>
        </div>
    );
}

function Step2({ csrfToken, email, domain }) {
    return (
        <form method="post" action="/api/auth/callback/credentials">
            <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
            <input name="email" type="hidden" defaultValue={email} />
            <input name="domain" type="hidden" defaultValue={domain} />
            <label>
                Code
                <input name="code" type="code" />
            </label>
            <br />
            <button type="submit">Sign in</button>
        </form>
    );
}

SignIn.getInitialProps = async (context) => {
    return {
        csrfToken: await csrfToken(context),
    };
};
