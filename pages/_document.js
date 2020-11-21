import Document, { Html, Head, Main, NextScript } from 'next/document';

class UnstockDocument extends Document {
    render() {
        return (
            <Html lang="en">
                <Head>
                    <link
                        href="http://fonts.googleapis.com/css?family=Roboto"
                        rel="stylesheet"
                        type="text/css"
                    />
                    <link href="/static/styles.css" rel="stylesheet" />
                    <link
                        rel="stylesheet"
                        href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
                        integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
                        crossOrigin=""
                    />
                    <script
                        src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"
                        integrity="sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA=="
                        crossOrigin=""
                    ></script>
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

export default UnstockDocument;
