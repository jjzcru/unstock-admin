import { ZeitProvider, CssBaseline } from '@zeit-ui/react';

export default function Unstock({ Component, pageProps }) {
    return (
        <ZeitProvider>
            <CssBaseline />
            <Component {...pageProps} />
        </ZeitProvider>
    );
}
