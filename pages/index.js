import styles from './Home.module.css';

import { Sidebar } from '@components/Sidebar';
import { Navbar } from '@components/Navbar';
import { useRouter } from 'next/router';

import lang from '@lang';

import { signIn, signOut, useSession } from 'next-auth/client';

export async function getStaticProps(ctx) {
    return {
        props: {
            lang,
        },
    };
}

export default function Session({ lang }) {
    const [session, loading] = useSession();
    return <>{session ? <Home session={session} lang={lang} /> : <Login />}</>;
}

function Login(ctx) {
    return (
        <div>
            Not signed in <br />
            <button onClick={signIn}>Sign in</button>
        </div>
    );
}

export class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            langName: 'es',
        };
    }

    componentDidMount() {
        this.setState({ langName: this.getDefaultLang() });
    }

    getDefaultLang = () => {
        if (!localStorage.getItem('lang')) {
            localStorage.setItem('lang', 'es');
        }

        return localStorage.getItem('lang');
    };

    changeLang = (langName) => {
        localStorage.setItem('lang', langName);
        this.setState({ langName });
    };

    render() {
        const { lang } = this.props;
        const { langName } = this.state;
        const selectedLang = lang[langName];

        return (
            <>
                <div className="container">
                    <Navbar lang={selectedLang} />
                    <div>
                        <Sidebar lang={selectedLang} />
                        <main>
                            <div>
                                <div className="squares">
                                    <div className="squares-title">
                                        {selectedLang['HOME_TODAY_SALES_TOTAL']}
                                    </div>
                                    <div className="squares-info">$10.00</div>
                                </div>
                                <div className="squares">
                                    <div className="squares-title">
                                        {
                                            selectedLang[
                                                'HOME_TODAY_SALES_QUANTITY'
                                            ]
                                        }
                                    </div>
                                    <div className="squares-info">20</div>
                                </div>
                            </div>
                            <section></section>
                        </main>
                    </div>
                </div>
            </>
        );
    }
}
