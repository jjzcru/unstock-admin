import React from 'react';
import Link from 'next/link';
import styles from './Products.module.css';

import { Sidebar } from '@components/Sidebar';
import { Navbar } from '@components/Navbar';

import lang from '@lang';

export async function getStaticProps() {
    return {
        props: {
            lang,
        },
    };
}

export default class Products extends React.Component {
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
        const { lang } = this.props;
        const { langName } = this.state;
        const selectedLang = lang[langName];
        return (
            <div className="container">
                <Navbar lang={selectedLang} />
                <div>
                    <Sidebar lang={selectedLang} />
                    <main className={styles['main']}>
                        <Topbar lang={selectedLang} />
                        <Content lang={selectedLang} />
                    </main>
                </div>
            </div>
        );
    }
}

// export default function Products() {
//   const [langName, setLangName] = useState(getLangName());
//   const selectedLang = lang[langName];
//   console.log(lang)

// }

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
        };
    }

    componentDidMount() {
        this.getData()
            .then((products) => {
                this.setState({ products });
            })
            .catch(console.error);
    }

    getData = async () => {
        let query = await fetch('/api/products');
        const data = await query.json();
        return data.products;
    };
    render() {
        const { products } = this.state;
        const { lang } = this.props;

        return (
            <div className={styles['content']}>
                <input
                    type="text"
                    className={styles['search-bar']}
                    placeholder={lang['PRODUCTS_SEARCH']}
                />

                <div className={styles['products']}>
                    <table className={styles['products-table']}>
                        <thead className={styles['products-table-header']}>
                            <tr>
                                <th></th>
                                <th></th>
                                <th>{lang['PRODUCTS_TABLE_HEADER_PRODUCT']}</th>
                                <th>
                                    {lang['PRODUCTS_TABLE_HEADER_INVENTORY']}
                                </th>
                                <th>{lang['PRODUCTS_TABLE_HEADER_TYPE']}</th>
                                <th>{lang['PRODUCTS_TABLE_HEADER_VENDOR']}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product, i) => {
                                return (
                                    <Product
                                        key={i}
                                        title={product.name}
                                        type={product.type}
                                        vendor={product.vendor}
                                    />
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

function Product({ id, title, inventory, type, vendor }) {
    return (
        <tr className={styles['product-row']}>
            <td className={styles['product-selection']}>
                <input type="checkbox" />
            </td>
            <td className={styles['product-image-container']}>
                <div className={styles['product-image']}></div>
            </td>
            <td className={styles['product-title']}>{title}</td>
            <td className={styles['product-inventory']}>
                X in stock for Y variants
            </td>
            <td className={styles['product-type']}>{type}</td>
            <td className={styles['product-vendor']}>{vendor}</td>
        </tr>
    );
}
