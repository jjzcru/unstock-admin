import React, { useState, useContext } from 'react';
import styles from './new.module.css';

import { Sidebar } from '@components/Sidebar';
import { Navbar } from '@components/Navbar';
import { GetTags, GetProducts } from '@domain/interactors/ProductsUseCases';

import lang from '@lang';

export async function getServerSideProps(ctx) {
    // console.log(ctx);
    const storeId = 'f2cf6dde-f6aa-44c5-837d-892c7438ed3d'; // I get this from a session

    let tags = [];
    let vendors = [];
    try {
        const getTags = new GetTags(storeId);
        const getProducts = new GetProducts(storeId);
        tags = await getTags.execute();
        const products = await getProducts.execute();
        vendors = [...new Set(products.map((item) => item.vendor))];
    } catch (e) {
        console.error(e);
    }
    console.log(vendors);
    return {
        props: { storeId, lang, tags, vendors }, // will be passed to the page component as props
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

    onSave = (data) => {
        const { storeId } = this.props;
        fetch('/api/products', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'x-unstock-store': storeId,
            },
            body: JSON.stringify(data),
        })
            .then((res) => res.json())
            .then((body) => {
                console.log(`Success`);
                console.log(body);
                window.history.back();
            })
            .catch(console.error);
    };

    render() {
        const { lang, tags, vendors, storeId } = this.props;
        const { langName } = this.state;

        const selectedLang = lang[langName];
        return (
            <DataContext.Provider
                value={{
                    vendors,
                    tags,
                    storeId,
                    lang: selectedLang,
                    onSave: this.onSave,
                }}
            >
                <div className="container">
                    <Navbar lang={selectedLang} />
                    <div>
                        <Sidebar lang={selectedLang} />
                        <main className={styles['main']}>
                            <Content
                                storeId={storeId}
                                lang={selectedLang}
                                tags={tags}
                            />
                        </main>
                    </div>
                </div>
            </DataContext.Provider>
        );
    }
}

class Content extends React.Component {
    static contextType = DataContext;
    constructor(props) {
        super(props);
        const { tags } = props;
        this.state = {
            storeId: '869a39ff-c8b2-4ef6-9617-86eafcf39e16',
            name: 'iPhone 12',
            price: 899.99,
            compareAt: 0,

            sku: '',
            barcode: '',
            inventoryPolicy: 'block',
            quantity: 20,

            shippingWeight: '',
            fullfilment: null,

            category: [],
            vendor: 'Apple',
            tagInput: '',
            tags,
        };
    }

    componentDidMount() {}

    handleCreateProduct = () => {
        const { onSave } = this.context;
        const product = this.state;
        onSave(product);
    };

    onTitleChange = (title) => {
        this.setState({
            name: title,
        });
    };

    onPricingChange = (price, compareAt) => {
        console.log(price);
        this.setState({
            price,
            compareAt,
        });
    };

    onInventoryChange = (sku, inventoryPolicy, barcode, quantity) => {
        this.setState({
            sku,
            inventoryPolicy,
            barcode,
            quantity,
        });
    };

    onShippingChange = (shippingWeight, fullfilment) => {
        this.setState({
            shippingWeight,
            fullfilment,
        });
    };

    onTagsInputChange = (value) => {
        this.setState({
            tagInput: value,
        });
    };

    handleRemoveTag = (tagToRemove) => {
        let { tags } = this.state;
        tags = tags.filter((tag) => tag !== tagToRemove);
        this.setState({ tags: tags });
    };

    handleKeyDown = (e, value) => {
        if (e.key === 'Enter' && value.length > 0) {
            let { tags } = this.state;
            tags.push(value);
            this.setState({
                tags: [...new Set(tags)],
                tagInput: '',
            });
        }
    };

    render() {
        const { lang, onSave } = this.context;
        let {
            name,
            price,
            compareAt,
            sku,
            barcode,
            inventoryPolicy,
            quantity,
            shippingWeight,
            fullfilment,
            category,
            vendor,
            tags,
            tagInput,
        } = this.state;
        return (
            <div>
                <div className={styles['top-bar']}>
                    <div className={styles['new-product-title']}>
                        <button> &lt; Products</button>
                        <h3>{lang['PRODUCTS_NEW_TITLE']}</h3>
                    </div>

                    <button
                        className={styles['add-button']}
                        onClick={() => this.handleCreateProduct()}
                    >
                        {lang['PRODUCTS_NEW_SAVE_BUTTON']}
                    </button>
                </div>
                <div className={styles['new-product-content']}>
                    <div>
                        <Title name={name} onChange={this.onTitleChange} />
                        <Images />
                        <Pricing
                            price={price}
                            compareAt={compareAt}
                            onChange={this.onPricingChange}
                        />
                        <Inventory
                            sku={sku}
                            barcode={barcode}
                            inventoryPolicy={inventoryPolicy}
                            quantity={quantity}
                            onChange={this.onInventoryChange}
                        />
                        <Shipping
                            shippingWeight={shippingWeight}
                            fullfilment={fullfilment}
                            onChange={this.onShippingChange}
                        />
                        <Variants />
                    </div>
                    <div>
                        <Organize
                            tags={tags}
                            onChange={this.onTagsInputChange}
                            handleKeyDown={this.handleKeyDown}
                            tagValue={tagInput}
                            removeTag={this.handleRemoveTag}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

function Title({ name, onChange }) {
    const { lang } = useContext(DataContext);
    return (
        <div className={styles['new-product-info-title']}>
            <h3>{lang['PRODUCTS_NEW_TITLE_LABEL']}</h3>
            <div>
                <input
                    type="text"
                    className={styles['new-product-info-title-input']}
                    value={name}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        </div>
    );
}

function Images() {
    const { lang } = useContext(DataContext);
    return (
        <div className={styles['new-product-info-images']}>
            <div className={styles['new-product-info-images-title']}>
                <h3>{lang['PRODUCTS_NEW_IMAGES_TITLE']}</h3>
                <button className={styles['add-button']}>
                    {lang['PRODUCTS_NEW_IMAGES_UPLOAD']}
                </button>
            </div>
            <div></div>
        </div>
    );
}

function Pricing({ price, compareAt, onChange }) {
    const { lang } = useContext(DataContext);
    return (
        <div className={styles['new-product-info-pricing']}>
            <h3>{lang['PRODUCTS_NEW_PRICING_TITLE']}</h3>
            <div className={styles['new-product-info-pricing-box']}>
                <div>
                    <h3 className={styles['new-product-info-pricing-title']}>
                        {lang['PRODUCTS_NEW_PRICE_LABEL']}
                    </h3>
                    <div>
                        <input
                            type="number"
                            className={styles['new-product-info-pricing-input']}
                            value={price}
                            onChange={(e) => {
                                onChange(e.target.value, compareAt);
                            }}
                        />
                    </div>
                </div>
                <div>
                    <h3 className={styles['new-product-info-pricing-title']}>
                        {lang['PRODUCTS_NEW_COMPARE_AT_LABEL']}
                    </h3>
                    <div>
                        <input
                            type="number"
                            className={styles['new-product-info-pricing-input']}
                            value={compareAt}
                            onChange={(e) => {
                                onChange(price, e.target.value);
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function Variants() {
    const { lang } = useContext(DataContext);
    return (
        <div className={styles['new-product-info-variants']}>
            {' '}
            <h3>{lang['PRODUCTS_NEW_VARIANTS_TITLE']}</h3>
            <div>
                <p>{lang['PRODUCTS_NEW_VARIANTS_MESSAGE']}</p>
            </div>
        </div>
    );
}

function Organize({ onChange, handleKeyDown, tagValue, removeTag }) {
    const { vendors, tags, lang } = useContext(DataContext);
    const [vendor, setVendor] = useState('');
    const [category, setCategory] = useState('');

    return (
        <div className={styles['new-product-organize-box']}>
            <h3>{lang['PRODUCTS_NEW_ORGANIZE_TITLE']}</h3>
            <div className={styles['new-product-info-organize-box-inputs']}>
                <div>
                    <div>
                        <h3
                            className={styles['new-product-info-pricing-title']}
                        >
                            {lang['PRODUCTS_NEW_CATEGORY_LABEL']}
                        </h3>
                        <input
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className={
                                styles['new-product-info-organize-box-input']
                            }
                        />
                    </div>
                    <div>
                        <h3
                            className={styles['new-product-info-pricing-title']}
                        >
                            {lang['PRODUCTS_NEW_VENDOR_LABEL']}
                        </h3>
                        <input
                            type="text"
                            className={styles['vendor-search']}
                            value={vendor}
                            onChange={(e) => setVendor(e.target.value)}
                        />
                    </div>
                </div>
                <div className={styles['tags-box']}>
                    <div>
                        <h3
                            className={styles['new-product-info-pricing-title']}
                        >
                            {lang['PRODUCTS_NEW_TAGS_LABEL']}
                        </h3>
                        <input
                            type="text"
                            value={tagValue}
                            onChange={(e) => onChange(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, tagValue)}
                            className={
                                styles['new-product-info-organize-box-input']
                            }
                        />
                    </div>
                    <div className={styles['tags-list']}>
                        {/* {tags.map((value) => {
                            <div>
                                <span>{value.name}</span>
                                <button>X</button>
                            </div>;
                        })} */}
                        {tags.map((tag, i) => {
                            return (
                                <div key={i}>
                                    <span>{tag}</span>
                                    <button onClick={() => removeTag(tag)}>
                                        X
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Inventory({ sku, inventoryPolicy, barcode, quantity, onChange }) {
    const { lang } = useContext(DataContext);
    return (
        <div className={styles['new-product-info-inventory']}>
            <h3>{lang['PRODUCTS_NEW_INVENTORY_TITLE']}</h3>
            <div className={styles['new-product-info-inventory-box']}>
                <div>
                    <div>
                        <h3
                            className={styles['new-product-info-pricing-title']}
                        >
                            {lang['PRODUCTS_NEW_SKU_LABEL']}
                        </h3>
                        <input
                            type="text"
                            className={styles['new-product-info-pricing-input']}
                            value={sku}
                            onChange={(e) => {
                                onChange(
                                    e.target.value,
                                    inventoryPolicy,
                                    barcode,
                                    quantity
                                );
                            }}
                        />
                    </div>
                    <div>
                        <h3
                            className={styles['new-product-info-pricing-title']}
                        >
                            {lang['PRODUCTS_NEW_INVENTORY_POLICY_LABEL']}
                        </h3>
                        <select
                            className={styles['new-product-info-pricing-input']}
                            onChange={(e) => {
                                onChange(
                                    sku,
                                    e.target.value,
                                    barcode,
                                    quantity
                                );
                            }}
                        >
                            <option value="block">
                                {lang['PRODUCTS_NEW_INVENTORY_POLICY_BLOCK']}
                            </option>
                            <option value="allow">
                                {lang['PRODUCTS_NEW_INVENTORY_POLICY_ALLOW']}
                            </option>
                        </select>
                    </div>
                </div>
                <div>
                    <div>
                        <h3
                            className={styles['new-product-info-pricing-title']}
                        >
                            {lang['PRODUCTS_NEW_BARCODE_LABEL']}
                        </h3>
                        <input
                            type="text"
                            className={styles['new-product-info-pricing-input']}
                            value={barcode}
                            onChange={(e) => {
                                onChange(
                                    sku,
                                    inventoryPolicy,
                                    e.target.value,
                                    quantity
                                );
                            }}
                        />
                    </div>
                    <div>
                        <h3
                            className={styles['new-product-info-pricing-title']}
                        >
                            {lang['PRODUCTS_NEW_QUANTITY_LABEL']}
                        </h3>
                        <input
                            type="number"
                            className={styles['new-product-info-pricing-input']}
                            value={quantity}
                            onChange={(e) => {
                                onChange(
                                    sku,
                                    inventoryPolicy,
                                    barcode,
                                    e.target.value
                                );
                            }}
                        />
                    </div>
                </div>
            </div>
            <div className={styles['new-product-info-inventory-checkbox']}>
                <input type="checkbox" id="allow" />
                <label htmlFor="allow">
                    {lang['PRODUCTS_NEW_INVENTORY_MESSAGE']}
                </label>
            </div>
        </div>
    );
}

function Shipping({ shippingWeight, fullfilment, onChange }) {
    const { lang } = useContext(DataContext);
    return (
        <div className={styles['new-product-info-shipping']}>
            <h3>{lang['PRODUCTS_NEW_SHIPPING_TITLE']}</h3>
            <div className={styles['new-product-info-shipping-box']}>
                <div>
                    <h3 className={styles['new-product-info-pricing-title']}>
                        {lang['PRODUCTS_NEW_WEIGHT_LABEL']}
                    </h3>
                    <input
                        type="text"
                        className={
                            styles['new-product-info-shipping-box-input']
                        }
                        value={shippingWeight}
                        onChange={(e) => onChange(e.target.value, fullfilment)}
                    />
                </div>
                <div>
                    <h3 className={styles['new-product-info-pricing-title']}>
                        {lang['PRODUCTS_NEW_FULLFILLMENT_LABEL']}
                    </h3>

                    <select
                        className={
                            styles['new-product-info-shipping-box-input']
                        }
                        onChange={(e) =>
                            onChange(shippingWeight, e.target.value)
                        }
                    >
                        <option value="ASAP">ASAP</option>
                        <option value="appetitto24">appetitto24</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
