import './global.css';
import { GeistProvider, CssBaseline } from '@geist-ui/react';
import { Provider } from 'next-auth/client';

export default function Unstock({ Component, pageProps }) {
    return (
        <Provider session={pageProps.session}>
            <GeistProvider>
                <CssBaseline />
                <Component {...pageProps} />
            </GeistProvider>
        </Provider>
    );
}
