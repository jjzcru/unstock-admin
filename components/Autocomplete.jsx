import React, { Component } from 'react';
import PropTypes from 'prop-types';
import productStyles from '../pages/products/Products.module.css';
import styles from './Autocomplete.module.css';

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
                console.log('sorting by title');
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
        const { suggestions } = this.props;
        const userInput = e.currentTarget.value;
        const filteredSuggestions = suggestions.filter(
            (suggestion) =>
                suggestion.toLowerCase().indexOf(userInput.toLowerCase()) > -1
        );

        this.setState({
            activeSuggestion: 0,
            filteredSuggestions,
            showSuggestions: true,
            userInput: e.currentTarget.value,
        });
    };

    onClick = (e) => {
        this.setState({
            activeSuggestion: 0,
            filteredSuggestions: [],
            showSuggestions: false,
            userInput: e.currentTarget.innerText,
            currentSearch: e.currentTarget.innerText,
        });
    };

    onKeyDown = (e) => {
        if (e.keyCode === 13) {
            this.setState({
                showSuggestions: false,
                currentSearch: this.state.userInput,
            });
        } else if (e.keyCode === 8 && this.state.userInput.length === 1) {
            console.log('limpiamos el search');
            this.setState({
                currentSearch: '',
            });
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

    render() {
        const {
            onChange,
            onClick,
            onKeyDown,
            state: {
                activeSuggestion,
                filteredSuggestions,
                showSuggestions,
                userInput,
                currentSearch,
            },
        } = this;

        const { lang } = this.props;
        const { products } = this.props;
        let filteredProducts = [];
        let suggestionsListComponent;

        console.log(products);

        if (showSuggestions && userInput) {
            if (filteredSuggestions.length) {
                suggestionsListComponent = (
                    <div className={styles['suggestions-box']}>
                        <div>
                            {filteredSuggestions.map((suggestion, index) => {
                                let className;

                                if (index === activeSuggestion) {
                                    className = '';
                                }

                                return (
                                    <a key={suggestion} onClick={onClick}>
                                        {suggestion}
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                );
            }
            //  else {
            //     suggestionsListComponent = (
            //         <div className={styles['suggestions-box']}>
            //             <a>Intente con palabras mas cortas.</a>
            //         </div>
            //     );
            // }
        }
        currentSearch.length > 0
            ? (filteredProducts = products.filter((e) =>
                  e.name.match(new RegExp(currentSearch, 'i'))
              ))
            : (filteredProducts = products);
        filteredProducts = this.sort(filteredProducts);

        return (
            <div className={productStyles['products-box']}>
                <div className={productStyles['search-box']}>
                    <React.Fragment>
                        <input
                            type="search"
                            onChange={onChange}
                            onKeyDown={onKeyDown}
                            value={userInput}
                            className={productStyles['search-bar']}
                            placeholder="Buscar Productos"
                        />
                        {suggestionsListComponent}
                    </React.Fragment>
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
                ' Articulos en ' +
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
    console.log(inventory);
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
                {/* <div className={productStyles['product-image']}></div> */}
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
