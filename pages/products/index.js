import React from 'react';
import Link from 'next/link';
import styles from './Products.module.css';

import { Sidebar } from '@components/Sidebar';
import { Navbar } from '@components/Navbar';

import Autocomplete from '../../components/Autocomplete';

import lang from '@lang';

import { useSession, getSession } from 'next-auth/client';

import { Loading } from '@geist-ui/react';

export async function getServerSideProps(ctx) {
    const session = await getSession(ctx);
    if (!session) {
        ctx.res.writeHead(302, { Location: '/' }).end();
        return;
    }

    return {
        props: { lang, session }, // will be passed to the page component as props
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
        localStorage.setItem('storeId', 'f2cf6dde-f6aa-44c5-837d-892c7438ed3d');
    }

    getDefaultLang = () => {
        if (!localStorage.getItem('lang')) {
            localStorage.setItem('lang', 'es');
        }

        return localStorage.getItem('lang');
    };

    render() {
        const { lang, session } = this.props;
        const { langName } = this.state;
        const selectedLang = lang[langName];
        return (
            <DataContext.Provider
                value={{
                    lang: selectedLang,
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
        let query = await fetch('/api/products', {
            method: 'GET',
            headers: {
                'x-unstock-store': localStorage.getItem('storeId'),
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
                        // className={styles['search-bar']}
                        suggestions={productSuggestions}
                        products={products}
                        lang={lang}
                    />
                )}

                {/* <AutoComplete
                    placeholder="Enter here"
                    options={options}
                    className={styles['search-bar']}
                /> */}
            </div>
        );
    }
}
