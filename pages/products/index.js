import React from 'react';
import Link from 'next/link';
import styles from './Products.module.css';

import { Sidebar } from '@components/Sidebar';
import { Navbar } from '@components/Navbar';

import lang from '@lang';

import { getSession } from 'next-auth/client';

import { Loading } from '@geist-ui/react';

import { getSessionData } from '@utils/session';

import { Table, Avatar, AutoComplete } from '@geist-ui/react';
import { Menu } from '@geist-ui/react-icons';

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
            options: [],
            search: '',
        };
    }

    componentDidMount() {
        this.setupProducts()
            .then((products) => {
                if (products.length > 0) {
                    let initialOptions = [];
                    var uniqueProducts = [
                        ...new Set(products.map((item) => item.title)),
                    ];
                    initialOptions = uniqueProducts.map((product) => {
                        return { label: product, value: product };
                    });
                    this.setState({
                        options: initialOptions,
                    });
                }
                this.setState({
                    products,
                    loading: false,
                });
            })
            .catch(console.error);
    }

    setupProducts = async () => {
        let products = [];
        //1. PEDIMOS LA CANTIDAD DE PRODUCTOS
        const qty = await this.getProductsQuantity();
        //2. PEDIMOS UNO A UNO CADA PRODUCTO
        products = await this.getProducts(qty);
        return products;
    };

    getProductsQuantity = async () => {
        const { storeId } = this.context;
        let query = await fetch('/api/filter-products/list', {
            method: 'GET',
            headers: {
                'x-unstock-store': storeId,
            },
        });
        const data = await query.json();
        return data.quantity;
    };

    getProducts = async (qty) => {
        const { storeId } = this.context;
        let promises = [];
        if (qty && qty > 0) {
            for (let index = 0; index < qty; index++) {
                promises.push(
                    new Promise(async (resolve, reject) => {
                        try {
                            const product = await fetch(
                                `/api/filter-products/pagination?limit=1&offset=${index}`,
                                {
                                    method: 'get',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'x-unstock-store': storeId,
                                    },
                                }
                            );
                            const values = await product.json();
                            resolve(...values);
                        } catch (e) {
                            reject(e);
                        }
                    })
                );
            }
        }
        return await Promise.all(promises);
    };

    onSearchProducts = (filter) => {
        if (filter.length === 0) {
            const { products } = this.state;
            var uniqueProducts = [
                ...new Set(products.map((item) => item.title)),
            ];
            const initialOptions = uniqueProducts.map((product) => {
                return { label: product, value: product };
            });
            this.setState({
                options: initialOptions,
                search: '',
            });
        } else {
            const { options } = this.state;
            let filterOptions = options.filter((option) =>
                option.value.match(new RegExp(filter, 'i'))
            );
            this.setState({
                options: filterOptions,
                search: filter,
            });
        }
    };

    render() {
        const { products, loading, options, search } = this.state;
        const { lang } = this.props;
        return (
            <div className={styles['content']}>
                {loading ? (
                    <Loading />
                ) : (
                    <div>
                        <Autocomplete
                            options={options}
                            onChange={(e) => this.onSearchProducts(e)}
                        />
                        <ProductTable
                            products={products}
                            lang={lang}
                            search={search}
                        />
                    </div>
                )}
            </div>
        );
    }
}

function Autocomplete({ options, onChange }) {
    return (
        <AutoComplete
            width="100%"
            options={options}
            placeholder="Buscar Producto"
            onSearch={onChange}
            clearable
        />
    );
}

function ProductTable({ products, lang, search }) {
    let filteredProducts = [];
    if (search.length === 0 || !search) {
        filteredProducts = products;
    } else {
        filteredProducts = products.filter((e) =>
            e.title.match(new RegExp(search, 'i'))
        );
    }

    return (
        <div className={styles['products']}>
            <table className={styles['products-table']}>
                <ProductsHeader lang={lang} />
                <ProductList products={filteredProducts} lang={lang} />
            </table>
        </div>
    );
}

function ProductsHeader({ lang }) {
    return (
        <thead className={styles['products-table-header']}>
            <tr>
                <th></th>
                <th></th>
                <th>{lang['PRODUCTS_TABLE_HEADER_PRODUCT']}</th>
                <th>{lang['PRODUCTS_TABLE_HEADER_INVENTORY']} </th>
                <th>{lang['PRODUCTS_TABLE_HEADER_VENDOR']} </th>
            </tr>
        </thead>
    );
}

function ProductList({ products, lang }) {
    return (
        <tbody>
            {products.map((product, i) => {
                return (
                    <Product
                        id={product.id}
                        key={i}
                        title={product.title}
                        type={product.type}
                        vendor={product.vendor}
                        inventory={product.inventory}
                        image={product.images[0].image || null}
                        lang={lang}
                    />
                );
            })}
        </tbody>
    );
}

function Product({ id, title, inventory, type, vendor, image, lang }) {
    return (
        <tr className={styles['product-row']}>
            <td className={styles['product-selection']}>
                <Menu size={20} />
            </td>
            <td className={styles['product-image-container']}>
                <Avatar src={image} isSquare />
            </td>
            <td className={styles['product-title']}>
                <Link href={`/products/${id}`}>
                    <span>{title}</span>
                </Link>
            </td>
            <td className={styles['product-inventory']}>
                {inventory.variants > 0
                    ? `${inventory.qty} ${lang['IN']} ${inventory.variants} ${
                          inventory.variants > 1
                              ? lang['VARIANTS']
                              : lang['VARIANT']
                      }`
                    : lang['NO_VARIANTS']}
            </td>
            <td className={styles['product-vendor']}>{vendor || ' -'}</td>
        </tr>
    );
}
