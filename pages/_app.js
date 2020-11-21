import './global.css';
import { ZeitProvider, CssBaseline } from '@zeit-ui/react';
import { Provider } from 'next-auth/client';

export default function Unstock({ Component, pageProps }) {
    return (
        <Provider session={pageProps.session}>
            <ZeitProvider>
                <CssBaseline />
                <Component {...pageProps} />
            </ZeitProvider>
        </Provider>
    );
}
