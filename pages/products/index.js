import React from 'react';
import Link from 'next/link';
import styles from './Products.module.css';

import { Sidebar } from '@components/Sidebar';
import { Navbar } from '@components/Navbar';

import lang from '@lang';

import { getSession } from 'next-auth/client';

import { Loading } from '@geist-ui/react';

import { getSessionData } from '@utils/session';

import { Avatar, AutoComplete, Button } from '@geist-ui/react';
import { Menu, Save, Archive } from '@geist-ui/react-icons';

import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import arrayMove from 'array-move';

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
            enableSorting: false,
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

    allowSorting = () => {
        this.setState({ enableSorting: true });
    };

    onSaveSorting = (products) => {
        console.log(products);
        this.setState({ enableSorting: false });
    };

    render() {
        const { lang, session, storeId } = this.props;
        const { langName, enableSorting } = this.state;
        const selectedLang = lang[langName];
        return (
            <DataContext.Provider
                value={{
                    lang: selectedLang,
                    storeId,
                    onSaveSorting: this.onSaveSorting,
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
                            <Topbar
                                lang={selectedLang}
                                sorting={enableSorting}
                                allowSorting={this.allowSorting}
                                saveSorting={this.saveSorting}
                            />
                            <Content
                                lang={selectedLang}
                                enableSorting={enableSorting}
                            />
                        </main>
                    </div>
                </div>
            </DataContext.Provider>
        );
    }
}

function Topbar({ lang, sorting, allowSorting, saveSorting }) {
    return (
        <div className={styles['top-bar']}>
            <div className={styles['title']}>
                <h2>{lang['PRODUCTS_TABLE_HEADER_PRODUCT']}</h2>
            </div>{' '}
            {sorting ? (
                <div>
                    {/* <Button
                        iconRight={<Save />}
                        type="secondary"
                        auto
                        onClick={() => saveSorting()}
                    /> */}
                </div>
            ) : (
                <div>
                    <SortroductsButton
                        lang={lang}
                        allowSorting={allowSorting}
                    />
                    <AddProductButton lang={lang} />
                </div>
            )}
        </div>
    );
}

function AddProductButton({ lang }) {
    return (
        <Link href="/products/new">
            <Button type="secondary" size="small">
                {lang['PRODUCTS_ADD_BUTTON']}
            </Button>
        </Link>
    );
}

function SortroductsButton({ lang, allowSorting }) {
    return (
        <Button
            iconRight={<Menu />}
            auto
            size="small"
            onClick={() => allowSorting()}
        />
    );
}

class Content extends React.Component {
    static contextType = DataContext;
    constructor(props) {
        super(props);
        this.state = {
            products: [],
            originalProducts: [],
            loading: true,
            options: [],
            search: '',
            sortingType: null,
            sortingDirection: false,
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
                    originalProducts: products,
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

    sortProducts = ({ oldIndex, newIndex }) => {
        this.setState(({ originalProducts }) => ({
            originalProducts: arrayMove(originalProducts, oldIndex, newIndex),
        }));
    };

    FilterSortProducts = (type) => {
        console.log(type);
        type === this.state.sortingType
            ? this.setState({
                  sortingType: type,
                  sortingDirection: !this.state.sortingDirection,
              })
            : this.setState({ sortingType: type });
    };

    selectedSort = (value) => {
        return value === this.state.sortingType ? true : false;
    };

    handleSaveSorting = () => {
        const { onSaveSorting } = this.context;
        const { originalProducts } = this.state;
        onSaveSorting(originalProducts);
    };

    render() {
        const {
            products,
            originalProducts,
            loading,
            options,
            search,
            sortingType,
            sortingDirection,
        } = this.state;

        console.log(originalProducts);

        const { enableSorting } = this.props;
        const { lang } = this.props;
        return (
            <div className={styles['content']}>
                {loading ? (
                    <Loading />
                ) : !enableSorting ? (
                    <div>
                        {' '}
                        <Autocomplete
                            options={options}
                            onChange={(e) => this.onSearchProducts(e)}
                        />
                        <FilterProductTable
                            products={products}
                            lang={lang}
                            search={search}
                            FilterSortProducts={this.FilterSortProducts}
                            selectedSort={this.selectedSort}
                            sortingDirection={sortingDirection}
                            sortingType={sortingType}
                        />
                    </div>
                ) : (
                    <div>
                        <div>
                            {' '}
                            <Button
                                iconRight={<Save />}
                                type="secondary"
                                auto
                                onClick={() => this.handleSaveSorting()}
                            >
                                Guardar
                            </Button>
                        </div>
                        <ProductTable
                            products={originalProducts}
                            lang={lang}
                            sortProducts={this.sortProducts}
                            selectedSort={this.selectedSort}
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

function ProductTable({ products, lang, sortProducts, selectedSort }) {
    return (
        <div className={styles['products']}>
            <table className={styles['products-table']}>
                <ProductsHeader
                    lang={lang}
                    sortProducts={null}
                    selectedSort={selectedSort}
                    sortingDirection={false}
                />
                <ProductList
                    products={products}
                    lang={lang}
                    sortProducts={sortProducts}
                />
            </table>
        </div>
    );
}

function FilterProductTable({
    products,
    lang,
    search,
    FilterSortProducts,
    selectedSort,
    sortingDirection,
    sortingType,
}) {
    let filteredProducts = [];
    if (search.length === 0 || !search) {
        filteredProducts = products;
    } else {
        filteredProducts = products.filter((e) =>
            e.title.match(new RegExp(search, 'i'))
        );
    }
    if (sortingType) {
        switch (sortingType) {
            case 'title':
                if (!sortingDirection) {
                    filteredProducts.sort((a, b) => {
                        let fa = a.title.toLowerCase(),
                            fb = b.title.toLowerCase();

                        if (fa < fb) {
                            return -1;
                        }
                        if (fa > fb) {
                            return 1;
                        }
                        return 0;
                    });
                    break;
                } else {
                    filteredProducts
                        .sort((a, b) => {
                            let fa = a.title.toLowerCase(),
                                fb = b.title.toLowerCase();

                            if (fa < fb) {
                                return -1;
                            }
                            if (fa > fb) {
                                return 1;
                            }
                            return 0;
                        })
                        .reverse();
                    break;
                }
            case 'vendor':
                if (!sortingDirection) {
                    filteredProducts.sort((a, b) => {
                        let fa = a.vendor.toLowerCase(),
                            fb = b.vendor.toLowerCase();

                        if (fa < fb) {
                            return -1;
                        }
                        if (fa > fb) {
                            return 1;
                        }
                        return 0;
                    });
                    break;
                } else {
                    filteredProducts
                        .sort((a, b) => {
                            let fa = a.vendor.toLowerCase(),
                                fb = b.vendor.toLowerCase();

                            if (fa < fb) {
                                return -1;
                            }
                            if (fa > fb) {
                                return 1;
                            }
                            return 0;
                        })
                        .reverse();
                    break;
                }

            case 'inventory':
                if (!sortingDirection) {
                    filteredProducts.sort(
                        (a, b) =>
                            parseFloat(a.inventory.qty) -
                            parseFloat(b.inventory.qty)
                    );
                    break;
                } else {
                    filteredProducts.sort(
                        (a, b) =>
                            parseFloat(b.inventory.qty) -
                            parseFloat(a.inventory.qty)
                    );
                    break;
                }
        }
    }

    return (
        <div className={styles['products']}>
            <table className={styles['products-table']}>
                <ProductsHeader
                    lang={lang}
                    sortProducts={FilterSortProducts}
                    selectedSort={selectedSort}
                    sortingDirection={sortingDirection}
                />
                <FilterProductList products={filteredProducts} lang={lang} />
            </table>
        </div>
    );
}

function ProductsHeader({
    lang,
    sortProducts,
    selectedSort,
    sortingDirection,
}) {
    return (
        <thead className={styles['products-table-header']}>
            <tr>
                <th></th>
                <th></th>
                <th onClick={(e) => sortProducts('title')}>
                    {lang['PRODUCTS_TABLE_HEADER_PRODUCT']}{' '}
                    {selectedSort('title') && (
                        <button className={styles['sort-button']}>
                            <img
                                src={
                                    !sortingDirection
                                        ? './static/icons/chevron-down.svg'
                                        : './static/icons/chevron-up.svg'
                                }
                            ></img>
                        </button>
                    )}
                </th>
                <th onClick={(e) => sortProducts('inventory')}>
                    {lang['PRODUCTS_TABLE_HEADER_INVENTORY']}{' '}
                    {selectedSort('inventory') && (
                        <button className={styles['sort-button']}>
                            <img
                                src={
                                    !sortingDirection
                                        ? './static/icons/chevron-down.svg'
                                        : './static/icons/chevron-up.svg'
                                }
                            ></img>
                        </button>
                    )}
                </th>
                <th onClick={(e) => sortProducts('vendor')}>
                    {lang['PRODUCTS_TABLE_HEADER_VENDOR']}
                    {selectedSort('vendor') && (
                        <button className={styles['sort-button']}>
                            <img
                                src={
                                    !sortingDirection
                                        ? './static/icons/chevron-down.svg'
                                        : './static/icons/chevron-up.svg'
                                }
                            ></img>
                        </button>
                    )}
                </th>
                <th></th>
            </tr>
        </thead>
    );
}

function FilterProductList({ products, lang }) {
    return (
        <tbody>
            {products.map((product, index) => (
                <FilterProductDetails
                    key={`item-${value}`}
                    index={index}
                    id={product.id}
                    key={index}
                    title={product.title}
                    type={product.type}
                    vendor={product.vendor}
                    inventory={product.inventory}
                    image={product.images[0].image || null}
                    lang={lang}
                    enabled={product.isPublish}
                    archived={product.isArchive}
                />
            ))}
        </tbody>
    );
}

function FilterProductDetails({
    id,
    title,
    inventory,
    vendor,
    image,
    lang,
    enabled,
    archived,
}) {
    return (
        <tr
            className={styles[enabled ? 'product-row' : 'disabled-product-row']}
        >
            <td className={styles['product-selection']}></td>
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
            <td className={styles['product-selection']}>
                {!archived && <Archive size={10} />}
            </td>
        </tr>
    );
}

function ProductList({ products, lang, sortProducts }) {
    return (
        <SortableList items={products} lang={lang} onSortEnd={sortProducts} />
    );
}

const SortableList = SortableContainer(({ items, lang }) => {
    return (
        <tbody>
            {items.map((product, index) => (
                <SortableItem
                    key={`item-${value}`}
                    index={index}
                    id={product.id}
                    key={index}
                    title={product.title}
                    type={product.type}
                    vendor={product.vendor}
                    inventory={product.inventory}
                    image={product.images[0].image || null}
                    lang={lang}
                />
            ))}
        </tbody>
    );
});

const SortableItem = SortableElement(
    ({ id, title, inventory, type, vendor, image, lang }) => (
        <tr className={styles['product-row']}>
            <td className={styles['product-selection']}>
                <Menu size={20} />
            </td>
            <td className={styles['product-image-container']}>
                <Avatar src={image} isSquare />
            </td>
            <td className={styles['product-title']}>
                <span>{title}</span>
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
            <td></td>
        </tr>
    )
);
