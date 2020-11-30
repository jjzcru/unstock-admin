import React from 'react';
import Link from 'next/link';
import styles from './Products.module.css';

import { Sidebar } from '@components/Sidebar';
import { Navbar } from '@components/Navbar';

import Autocomplete from '../../components/Autocomplete';

import lang from '@lang';

import { useSession, getSession } from 'next-auth/client';

import { Loading } from '@geist-ui/react';

import { getSessionData } from '@utils/session';

export async function getServerSideProps(ctx) {
    const session = await getSession(ctx);
    if (!session) {
        ctx.res.writeHead(302, { Location: '/' }).end();
        return;
    }
    const { storeId } = getSessionData(session);

    return {
        props: { lang, session, storeId }, // will be passed to the page component as props
    };
}

const DataContext = React.createContext();

export default class Products extends React.Component {
    static contextType = DataContext;
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

    render() {
        const { lang, session, storeId } = this.props;
        const { langName } = this.state;
        const selectedLang = lang[langName];
        return (
            <DataContext.Provider
                value={{
                    lang: selectedLang,
                    storeId,
                }}
            >
                <div className="container">
                    <Navbar
                        lang={selectedLang}
                        userName={session.user.name}
                        storeName={'Unstock'}
                    />
                    <div>
                        <Sidebar lang={selectedLang} />
                        <main className={styles['main']}>
                            <Topbar lang={selectedLang} />
                            <Content lang={selectedLang} />
                        </main>
                    </div>
                </div>
            </DataContext.Provider>
        );
    }
}

function Topbar({ lang }) {
    return (
        <div className={styles['top-bar']}>
            <div className={styles['title']}>
                <h2>{lang['PRODUCTS_TABLE_HEADER_PRODUCT']}</h2>
            </div>
            <AddProductButton lang={lang} />
        </div>
    );
}

function AddProductButton({ lang }) {
    return (
        <Link href="/products/new">
            <button className={styles['add-button']}>
                <a>{lang['PRODUCTS_ADD_BUTTON']}</a>
            </button>
        </Link>
    );
}

class Content extends React.Component {
    static contextType = DataContext;
    constructor(props) {
        super(props);
        this.state = {
            products: [],
            loading: true,
        };
    }

    componentDidMount() {
        this.getData()
            .then((products) => {
                this.setState({ products, loading: false });
            })
            .catch(console.error);
    }

    getData = async () => {
        const { storeId } = this.context;
        let query = await fetch('/api/products', {
            method: 'GET',
            headers: {
                'x-unstock-store': storeId,
            },
        });
        const data = await query.json();
        return data.products;
    };

    render() {
        const { products, loading } = this.state;
        const { lang } = this.props;
        let productSuggestions = [];
        if (!!products) {
            var uniqueProducts = [
                ...new Set(products.map((item) => item.title)),
            ];
            productSuggestions = uniqueProducts.map((product) => {
                return { label: product, value: product };
            });
        }

        return (
            <div className={styles['content']}>
                {loading ? (
                    <Loading />
                ) : (
                    <Autocomplete
                        suggestions={productSuggestions}
                        products={products}
                        lang={lang}
                    />
                )}
            </div>
        );
    }
}
