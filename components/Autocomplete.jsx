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
        });
    };
    onKeyDown = (e) => {
        const { activeSuggestion, filteredSuggestions } = this.state;

        if (e.keyCode === 13) {
            this.setState({
                activeSuggestion: 0,
                showSuggestions: false,
                userInput: filteredSuggestions[activeSuggestion],
            });
        } else if (e.keyCode === 38) {
            if (activeSuggestion === 0) {
                return;
            }

            this.setState({ activeSuggestion: activeSuggestion - 1 });
        } else if (e.keyCode === 40) {
            if (activeSuggestion - 1 === filteredSuggestions.length) {
                return;
            }

            this.setState({ activeSuggestion: activeSuggestion + 1 });
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
            },
        } = this;

        const { lang } = this.props;
        const { products } = this.props;
        let filteredProducts = [];
        let suggestionsListComponent;

        if (showSuggestions && userInput) {
            if (filteredSuggestions.length) {
                suggestionsListComponent = (
                    <ul className="suggestions">
                        {filteredSuggestions.map((suggestion, index) => {
                            let className;

                            if (index === activeSuggestion) {
                                className = '';
                            }

                            return (
                                <li key={suggestion} onClick={onClick}>
                                    {suggestion}
                                </li>
                            );
                        })}
                    </ul>
                );
            } else {
                suggestionsListComponent = (
                    <div className="no-suggestions">
                        <em>No suggestions</em>
                    </div>
                );
            }
        }
        userInput
            ? (filteredProducts = products.filter((e) =>
                  e.name.match(new RegExp(userInput, 'i'))
              ))
            : (filteredProducts = products);

        // if (!filteredProducts.length) {
        //     console.log('no hay productos');
        // }

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
            <td className={productStyles['product-inventory']}>
                X in stock for Y variants
            </td>
            <td className={productStyles['product-type']}>{type}</td>
            <td className={productStyles['product-vendor']}>{vendor}</td>
        </tr>
    );
}

export default Autocomplete;
