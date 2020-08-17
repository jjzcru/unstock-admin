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
        this.state = {
            activeSuggestion: 0,
            filteredSuggestions: [],
            showSuggestions: false,
            currentSearch: '',
            userInput: '',
            products: [],
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
                        <ProductsHeader lang={lang} />
                        <ProductList products={filteredProducts} />
                    </table>
                </div>
            </div>
        );
    }
}

function ProductsHeader({ lang }) {
    return (
        <thead className={productStyles['products-table-header']}>
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
        <tr className={productStyles['product-row']}>
            <td className={productStyles['product-selection']}>
                <input type="checkbox" />
            </td>
            <td className={productStyles['product-image-container']}>
                <div className={productStyles['product-image']}></div>
            </td>
            <td className={productStyles['product-title']}>{title}</td>
            <td className={productStyles['product-inventory']}>{inventory}</td>
            <td className={productStyles['product-type']}>{type}</td>
            <td className={productStyles['product-vendor']}>{vendor}</td>
        </tr>
    );
}

export default Autocomplete;
