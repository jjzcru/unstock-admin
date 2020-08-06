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
