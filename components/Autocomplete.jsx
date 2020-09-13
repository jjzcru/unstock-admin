import React, { Component } from 'react';
import PropTypes from 'prop-types';
import productStyles from '../pages/products/Products.module.css';
import styles from './Autocomplete.module.css';
import { AutoComplete } from '@zeit-ui/react';

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
            sortingDirection: true,
        };
    }

    sort(products) {
        switch (this.state.sortingType) {
            case 'title':
                return products.sort((a, b) => {
                    let fa = a.name.toLowerCase(),
                        fb = b.name.toLowerCase();

                    if (fa < fb) {
                        return -1;
                    }
                    if (fa > fb) {
                        return 1;
                    }
                    return 0;
                });
            case 'type':
                return products.sort((a, b) => {
                    let fa = a.type.toLowerCase(),
                        fb = b.type.toLowerCase();

                    if (fa < fb) {
                        return -1;
                    }
                    if (fa > fb) {
                        return 1;
                    }
                    return 0;
                });
            case 'vendor':
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
            default:
                return products.sort((a, b) => (a.name > b.name ? 1 : -1));
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
            state: { filteredSuggestions, userInput, currentSearch },
        } = this;

        const { lang } = this.props;
        const { products } = this.props;
        let filteredProducts = [];
        currentSearch.length > 0
            ? (filteredProducts = products.filter((e) =>
                  e.name.match(new RegExp(currentSearch, 'i'))
              ))
            : (filteredProducts = products);
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
                <div className={productStyles['products']}>
                    <table className={productStyles['products-table']}>
                        <ProductsHeader
                            lang={lang}
                            sortProducts={this.sortProducts}
                            selectedSort={this.selectedSort}
                        />
                        <ProductList products={filteredProducts} />
                    </table>
                </div>
            </div>
        );
    }
}

function ProductsHeader({ lang, sortProducts, selectedSort }) {
    return (
        <thead className={productStyles['products-table-header']}>
            <tr>
                <th></th>
                <th></th>
                <th onClick={(e) => sortProducts('title')}>
                    {lang['PRODUCTS_TABLE_HEADER_PRODUCT']}
                    {selectedSort('title') && (
                        <button className={productStyles['sort-button']}>
                            <img src="./static/icons/chevron-down.svg"></img>
                        </button>
                    )}
                </th>
                <th onClick={(e) => sortProducts('inventory')}>
                    {lang['PRODUCTS_TABLE_HEADER_INVENTORY']}{' '}
                    {selectedSort('inventory') && (
                        <button className={productStyles['sort-button']}>
                            <img src="./static/icons/chevron-down.svg"></img>
                        </button>
                    )}
                </th>
                <th onClick={(e) => sortProducts('type')}>
                    {lang['PRODUCTS_TABLE_HEADER_TYPE']}{' '}
                    {selectedSort('type') && (
                        <button className={productStyles['sort-button']}>
                            <img src="./static/icons/chevron-down.svg"></img>
                        </button>
                    )}
                </th>
                <th onClick={(e) => sortProducts('vendor')}>
                    {lang['PRODUCTS_TABLE_HEADER_VENDOR']}{' '}
                    {selectedSort('vendor') && (
                        <button className={productStyles['sort-button']}>
                            <img src="./static/icons/chevron-down.svg"></img>
                        </button>
                    )}
                </th>
            </tr>
        </thead>
    );
}

function ProductList({ products }) {
    products.map((product) => {
        product.inventory = product.variants.reduce((total, variant) => {
            var quantityText =
                product.variants.length > 1 ? ' Variantes' : ' Variante';
            return (
                total +
                variant.quantity +
                lang['AUTOCOMPLETE_ARTICLES_IN'] +
                product.variants.length +
                quantityText
            );
        }, 0);
    });
    return (
        <tbody>
            {products.map((product, i) => {
                return (
                    <Product
                        key={i}
                        title={product.name}
                        type={product.type}
                        vendor={product.vendor}
                        inventory={product.inventory}
                    />
                );
            })}
        </tbody>
    );
}

function Product({ title, inventory, type, vendor }) {
    return (
        <tr className={productStyles['product-row']}>
            <td className={productStyles['product-selection']}>
                <input type="checkbox" />
            </td>
            <td className={productStyles['product-image-container']}>
                <img
                    src="./static/icons/x.svg"
                    className={productStyles['product-image']}
                ></img>
            </td>
            <td className={productStyles['product-title']}>{title}</td>
            <td className={productStyles['product-inventory']}>{inventory}</td>
            <td className={productStyles['product-type']}>{type || ' -'}</td>
            <td className={productStyles['product-vendor']}>
                {vendor || ' -'}
            </td>
        </tr>
    );
}

export default Autocomplete;
