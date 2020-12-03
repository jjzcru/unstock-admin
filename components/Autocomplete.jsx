import React, { Component } from 'react';
import PropTypes from 'prop-types';
import productStyles from '../pages/products/Products.module.css';
import Link from 'next/link';
import {
    AutoComplete,
    Avatar,
    Display,
    Image,
    Code,
    Button,
} from '@geist-ui/react';

import lang from '@lang';
export async function getStaticProps() {
    return {
        props: {
            lang,
        },
    };
}

export class Autocomplete extends Component {
    constructor(props) {
        super(props);
        this.sortedProducts = [];
        this.state = {
            activeSuggestion: 0,
            filteredSuggestions: [],
            showSuggestions: false,
            currentSearch: '',
            userInput: '',
            langName: 'es',
            sortingType: 'title',
            sortingDirection: false,
        };
    }

    sort(products) {
        const direction = this.state.sortingDirection;
        switch (this.state.sortingType) {
            case 'title':
                if (!direction) {
                    return products.sort((a, b) => {
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
                } else {
                    return products
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
                }

            // case 'type':
            //     return products.sort((a, b) => {
            //         let fa = a.type.toLowerCase(),
            //             fb = b.type.toLowerCase();

            //         if (fa < fb) {
            //             return -1;
            //         }
            //         if (fa > fb) {
            //             return 1;
            //         }
            //         return 0;
            //     });
            case 'vendor':
                if (!direction) {
                    return products.sort((a, b) => {
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
                } else {
                    return products
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
                }

            case 'inventory':
                if (!direction) {
                    return products.sort(
                        (a, b) =>
                            parseFloat(a.quantity) - parseFloat(b.quantity)
                    );
                } else {
                    return products.sort(
                        (a, b) =>
                            parseFloat(b.quantity) - parseFloat(a.quantity)
                    );
                }

            default:
                return products.sort((a, b) => (a.title > b.title ? 1 : -1));
        }
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

    static propTypes = {
        suggestions: PropTypes.instanceOf(Array),
        products: PropTypes.instanceOf(Array),
    };
    static defaultProperty = {
        suggestions: [],
        products: [],
    };

    onChange = (e) => {
        this.setState({
            userInput: e,
        });
    };

    onSearchSuggestion = (currentValue) => {
        const { suggestions } = this.props;
        if (!currentValue)
            return this.setState({
                filteredSuggestions: [],
                currentSearch: '',
            });
        const relatedOptions = suggestions.filter(
            (suggestion) =>
                suggestion.value
                    .toLowerCase()
                    .indexOf(currentValue.toLowerCase()) > -1
        );
        this.setState({
            filteredSuggestions: relatedOptions,
        });
    };

    onKeyDown = (e) => {
        if (e.keyCode === 13) {
            this.setState({ currentSearch: this.state.userInput });
        }
    };

    sortProducts = (type) => {
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

    selectedSortingDirection = () => {
        return this.state.sortingDirection;
    };

    onClick = (value) => {
        this.setState({
            userInput: value,
            currentSearch: value,
        });
    };

    render() {
        const {
            onChange,
            onKeyDown,
            state: {
                filteredSuggestions,
                userInput,
                currentSearch,
                sortingDirection,
            },
        } = this;

        const { lang } = this.props;
        const { products } = this.props;
        let filteredProducts = [];
        currentSearch.length > 0
            ? (filteredProducts = products.filter((e) =>
                  e.title.match(new RegExp(currentSearch, 'i'))
              ))
            : (filteredProducts = products);
        if (filteredProducts && filteredProducts.length > 0)
            filteredProducts = this.sort(filteredProducts);

        return (
            <div className={productStyles['products-box']}>
                <div className={productStyles['search-box']}>
                    <AutoComplete
                        value={userInput}
                        placeholder={lang['AUTOCOMPLETE_FILTER_PRODUCTS']}
                        options={filteredSuggestions}
                        width="100%"
                        onSearch={this.onSearchSuggestion}
                        onSelect={this.onClick}
                        onChange={onChange}
                        onKeyDown={onKeyDown}
                        clearable
                    />
                </div>
                {filteredProducts.length === 0 ? (
                    <div className={productStyles['empty-state-box']}>
                        <Display
                            caption={
                                <span>
                                    No encontramos productos relacionados a tu
                                    busqueda.
                                </span>
                            }
                        >
                            <Image
                                width={540}
                                height={246}
                                src="./static/images/cloud.png"
                            />
                        </Display>
                        {products.length === 0 && (
                            <Button auto type="success-light">
                                Agregar un producto
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className={productStyles['products']}>
                        <table className={productStyles['products-table']}>
                            <ProductsHeader
                                lang={lang}
                                sortProducts={this.sortProducts}
                                selectedSort={this.selectedSort}
                                sortingDirection={sortingDirection}
                            />
                            <ProductList
                                products={filteredProducts}
                                lang={lang}
                            />
                        </table>
                    </div>
                )}
            </div>
        );
    }
}

function ProductsHeader({
    lang,
    sortProducts,
    selectedSort,
    sortingDirection,
}) {
    return (
        <thead className={productStyles['products-table-header']}>
            <tr>
                <th></th>
                <th></th>
                <th onClick={(e) => sortProducts('title')}>
                    {lang['PRODUCTS_TABLE_HEADER_PRODUCT']}
                    {selectedSort('title') && (
                        <button className={productStyles['sort-button']}>
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
                        <button className={productStyles['sort-button']}>
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
                    {lang['PRODUCTS_TABLE_HEADER_VENDOR']}{' '}
                    {selectedSort('vendor') && (
                        <button className={productStyles['sort-button']}>
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
            </tr>
        </thead>
    );
}

function ProductList({ products, lang }) {
    products.map((product) => {
        // product.inventory = 0;
        const totalInventory = product.variants.reduce((acc, variant) => {
            acc += variant.quantity;
            return acc;
        }, 0);
        const quantityText =
            product.variants.length > 1 ? lang['VARIANTS'] : lang['VARIANT'];
        product.inventory = `${totalInventory} ${lang['AUTOCOMPLETE_ARTICLES_IN']} ${product.variants.length} ${quantityText}`.toLowerCase();
        product.image =
            product.images.length > 0
                ? product.images[0].image
                : './static/icons/x.svg';
    });
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
                        image={product.image}
                    />
                );
            })}
        </tbody>
    );
}

function Product({ id, title, inventory, type, vendor, image }) {
    return (
        <tr className={productStyles['product-row']}>
            <td className={productStyles['product-selection']}>
                <input type="checkbox" />
            </td>
            <td className={productStyles['product-image-container']}>
                <Avatar src={image} isSquare />
            </td>
            <td className={productStyles['product-title']}>
                <Link href={`/products/${id}`}>
                    <span>{title}</span>
                </Link>
            </td>
            <td className={productStyles['product-inventory']}>{inventory}</td>
            <td className={productStyles['product-vendor']}>
                {vendor || ' -'}
            </td>
        </tr>
    );
}

export default Autocomplete;
