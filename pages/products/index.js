import React from 'react';
import Link from 'next/link';
import styles from './Products.module.css';

import { Sidebar } from '@components/Sidebar';
import { Navbar } from '@components/Navbar';

import Autocomplete from '../../components/Autocomplete';

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
        localStorage.setItem('storeId', '7c3ec282-1822-469f-86d6-90ce3ef9e63e');
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
        const { products } = this.state;
        const { lang } = this.props;
        let productSuggestions = [
            ...new Set(products.map((item) => item.name)),
        ];
        return (
            <div className={styles['content']}>
                <Autocomplete
                    className={styles['search-bar']}
                    suggestions={productSuggestions}
                    products={products}
                    lang={lang}
                />
            </div>
        );
    }
}

function ProductsHeader({ lang }) {
    return (
        <thead className={styles['products-table-header']}>
            <tr>
                <th></th>
                <th></th>
                <th>{lang['PRODUCTS_TABLE_HEADER_PRODUCT']}</th>
                <th>{lang['PRODUCTS_TABLE_HEADER_INVENTORY']}</th>
                <th>{lang['PRODUCTS_TABLE_HEADER_TYPE']}</th>
                <th>{lang['PRODUCTS_TABLE_HEADER_VENDOR']}</th>
            </tr>
        </thead>
    );
}

function ProductList({ products }) {
    return (
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
    );
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
