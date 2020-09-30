import React, { useState, useContext, useMemo, useCallback } from 'react';
import Link from 'next/link';
import styles from './new.module.css';

import { Sidebar } from '@components/Sidebar';
import { Navbar } from '@components/Navbar';
import { GetTags, GetProducts } from '@domain/interactors/ProductsUseCases';

import { useDropzone } from 'react-dropzone';

import { Avatar, Badge, Button } from '@zeit-ui/react';

import lang from '@lang';

export async function getServerSideProps(ctx) {
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
            files: [],
            loading: false,
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
        this.setState((prevState) => ({
            loading: !prevState.loading,
        }));
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
            .then(async (body) => {
                const acceptedFiles = data.images;
                const formData = new FormData();
                let contentLength = 0;
                for (let file of acceptedFiles) {
                    const { name, buffer } = file;
                    const blob = new Blob([buffer]);
                    contentLength += blob.size;
                    formData.append('image', blob, name);
                }

                const res = await this.sendImages({
                    formData,
                    productId: body.product.id,
                    storeId,
                });

                window.location.href = '/products';
            })
            .catch(() => {
                console.log('error creando producto'); //MOSTRAR MENSAJE AL USUARIO
                this.setState((prevState) => ({
                    loading: !prevState.loading,
                }));
            });
    };

    sendImages = ({ formData, productId, storeId }) => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState == XMLHttpRequest.DONE) {
                    const res = JSON.parse(xhr.responseText);
                    if (!!res.error) {
                        reject(new Error(res.error));
                        return;
                    }
                    resolve(res);
                }
            };
            xhr.open('POST', `/api/products/images/${productId}`);
            xhr.setRequestHeader('x-unstock-store', storeId);
            xhr.send(formData);
        });
    };

    render() {
        const { lang, tags, vendors, storeId } = this.props;
        const { langName, files, loading } = this.state;
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
                                files={files}
                                loading={loading}
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
        const { tags } = this.props;
        this.state = {
            name: '',
            price: 0,
            compareAt: 0,

            sku: '',
            barcode: '',
            inventoryPolicy: 'block',
            quantity: 1,

            shippingWeight: '',
            fullfilment: null,

            category: [],
            vendor: '',
            showVendors: true,
            tagInput: '',
            tags,
            tagList: [],
            files: [],

            //validations
            disableButton: false,
        };
    }

    handleCreateProduct = () => {
        const { onSave } = this.context;
        const product = this.state;
        product.tags = this.state.tagList;
        product.images = this.state.files;

        onSave(product);
    };

    validateFields = () => {
        console.log('here');
    };

    onTitleChange = (title) => {
        this.setState({
            name: title,
        });
    };

    onPricingChange = (price, compareAt) => {
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
        let { tagList } = this.state;
        tagList = tagList.filter((tag) => tag !== tagToRemove);
        this.setState({ tagList: tagList });
    };

    handleKeyDown = (e, value) => {
        if (e.key === 'Enter' && value.length > 0) {
            let { tagList } = this.state;
            tagList.push(value);
            this.setState({
                tagList: [...new Set(tagList)],
                tagInput: '',
            });
        }
    };

    selectTag = (value) => {
        let { tagList } = this.state;
        tagList.push(value);
        this.setState({
            tagList: [...new Set(tagList)],
            tagInput: '',
        });
    };

    setVendor = (value) => {
        if (value.length === 1) {
            this.setState({
                showVendors: true,
            });
            value = value.toUpperCase();
        }
        this.setState({
            vendor: value,
        });
    };

    existVendor = (value, vendors) => {
        return vendors.filter((vendor) => {
            if (vendor.toLowerCase() === value.toLowerCase()) {
                return vendor;
            }
        }).length > 0
            ? true
            : false;
    };

    selectVendor = (e, value) => {
        if (e.key === 'Enter' && value.length > 0) {
            this.setState({
                vendor: value,
                showVendors: false,
            });
        } else if (e === 'click' && value.length > 0) {
            this.setState({
                vendor: value,
                showVendors: false,
            });
        }
    };

    removeFile = (index) => {
        let { files } = this.state;
        files = files.filter((file, key) => key !== index);
        this.setState({ files: files });
    };

    onDrop = async (incommingFiles) => {
        const { files } = this.state;
        for (let file of incommingFiles) {
            files.push({
                name: file.name,
                buffer: await this.fileToBinary(file),
                preview: file.preview,
            });
        }
        this.setState({ files });
    };

    fileToBinary = async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onabort = () =>
                reject(new Error('file reading was aborted'));
            reader.onerror = () => reject(new Error('file reading has failed'));
            reader.onload = () => resolve(reader.result);
            reader.readAsArrayBuffer(file);
        });
    };

    render() {
        const { lang } = this.context;
        const { loading } = this.props;
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
            showVendors,
            tags,
            tagInput,
            tagList,
            files,
        } = this.state;

        return (
            <div>
                <div className={styles['grid-container']}>
                    <div>
                        <div>
                            <div className={styles['top-bar']}>
                                <div className={styles['new-product-title']}>
                                    <Link href="/products">
                                        <button>
                                            {' '}
                                            &lt; {lang['PRODUCTS']}
                                        </button>
                                    </Link>
                                    <h3>{lang['PRODUCTS_NEW_TITLE']}</h3>
                                </div>
                            </div>
                        </div>

                        <div className={styles['new-product-content']}>
                            <div>
                                <Title
                                    name={name}
                                    onChange={this.onTitleChange}
                                />
                                <Images
                                    onDrop={this.onDrop}
                                    files={files}
                                    buttonClick={this.onLoadImageButton}
                                    removeFile={this.removeFile}
                                />

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
                        </div>
                    </div>
                    <div>
                        <div>
                            <Button
                                shadow
                                type="secondary"
                                onClick={() => this.handleCreateProduct()}
                                loading={loading}
                                disabled={
                                    this.state.name.length === 0 ||
                                    this.state.files.length === 0 ||
                                    this.state.price <= 0
                                }
                            >
                                {lang['PRODUCTS_NEW_SAVE_BUTTON']}
                            </Button>
                        </div>

                        <div>
                            <Organize
                                vendor={vendor}
                                tags={tags}
                                tagList={tagList}
                                onChange={this.onTagsInputChange}
                                handleKeyDown={this.handleKeyDown}
                                tagValue={tagInput}
                                removeTag={this.handleRemoveTag}
                                selectTag={this.selectTag}
                                selectVendor={this.selectVendor}
                                showVendors={showVendors}
                                setVendor={this.setVendor}
                                existVendor={this.existVendor}
                            />
                        </div>
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
            <div>
                {' '}
                <h3>
                    {lang['PRODUCTS_NEW_TITLE_LABEL']}
                    {'  '}{' '}
                    <small className={styles['new-product-required']}>
                        {lang['PRODUCTS_NEW_REQUIRED']}
                    </small>
                </h3>{' '}
            </div>

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

function Images({ onDrop, files, buttonClick, removeFile }) {
    const { lang } = useContext(DataContext);

    return (
        <div className={styles['new-product-info-images']}>
            <DropzoneArea
                onDropFiles={onDrop}
                files={files}
                lang={lang}
                removeFile={removeFile}
            />
        </div>
    );
}

function Pricing({ price, compareAt, onChange }) {
    const { lang } = useContext(DataContext);
    return (
        <div className={styles['new-product-info-pricing']}>
            {/* <h3>{lang['PRODUCTS_NEW_PRICING_TITLE']}</h3> */}
            <div className={styles['new-product-info-pricing-box']}>
                <div>
                    <h3 className={styles['new-product-info-pricing-title']}>
                        {lang['PRODUCTS_NEW_PRICE_LABEL']} {'  '}{' '}
                        <small className={styles['new-product-required']}>
                            {lang['PRODUCTS_NEW_REQUIRED']}
                        </small>
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

function Organize({
    vendor,
    tags,
    tagList,
    onChange,
    handleKeyDown,
    tagValue,
    removeTag,
    selectTag,
    selectVendor,
    showVendors,
    setVendor,
    existVendor,
}) {
    const { vendors, lang } = useContext(DataContext);
    // const [vendor, setVendor] = useState('');
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
                        <div className={styles['tags-box-assembly']}>
                            <input
                                type="text"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className={
                                    styles[
                                        'new-product-info-organize-box-input'
                                    ]
                                }
                            />
                        </div>
                    </div>
                    <div>
                        <h3
                            className={styles['new-product-info-pricing-title']}
                        >
                            {lang['PRODUCTS_NEW_VENDOR_LABEL']}
                        </h3>
                        <div className={styles['vendor-box']}>
                            <input
                                type="text"
                                className={styles['vendor-search']}
                                value={vendor}
                                onChange={(e) => setVendor(e.target.value)}
                                onKeyDown={(e) => selectVendor(e, vendor)}
                            />
                            {vendor.length > 0 && showVendors && (
                                <div className={styles['vendor-list']}>
                                    <div
                                        className={styles['vendor-suggestions']}
                                    >
                                        <ul
                                            className={
                                                styles[
                                                    'vendor-suggestions-list'
                                                ]
                                            }
                                        >
                                            <li
                                                key="vendor-0"
                                                data-id={vendor}
                                                className={
                                                    styles[
                                                        'vendor-suggestions-list'
                                                    ]
                                                }
                                                onClick={() =>
                                                    selectVendor(
                                                        'click',
                                                        vendor
                                                    )
                                                }
                                            >
                                                {!existVendor(
                                                    vendor,
                                                    vendors
                                                ) && 'Agregar'}
                                            </li>

                                            {vendors
                                                .filter((vendorValue) =>
                                                    vendorValue.match(
                                                        new RegExp(vendor, 'i')
                                                    )
                                                )
                                                .map((vendorValue) => {
                                                    return (
                                                        <li
                                                            key={vendorValue}
                                                            data-id={
                                                                vendorValue
                                                            }
                                                            onClick={() =>
                                                                selectVendor(
                                                                    'click',
                                                                    vendorValue
                                                                )
                                                            }
                                                            className={
                                                                styles[
                                                                    'vendor-suggestions-list'
                                                                ]
                                                            }
                                                        >
                                                            {vendorValue}
                                                        </li>
                                                    );
                                                })}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className={styles['tags-box']}>
                    <h3 className={styles['new-product-info-pricing-title']}>
                        {lang['PRODUCTS_NEW_TAGS_LABEL']}
                    </h3>

                    <div className={styles['tags-box-assembly']}>
                        <input
                            type="text"
                            value={tagValue}
                            onChange={(e) => onChange(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, tagValue)}
                            className={
                                styles['new-product-info-organize-box-input']
                            }
                        />
                        {tagValue.length > 0 && (
                            <div className={styles['tags-suggestions']}>
                                <ul className={styles['tags-suggestions-list']}>
                                    <li
                                        key="tag-0"
                                        className={
                                            styles['tags-suggestions-list']
                                        }
                                        onClick={(e) => selectTag(tagValue)}
                                    >
                                        Agregar a lista
                                    </li>

                                    {tags
                                        .filter((tag) =>
                                            tag.match(new RegExp(tagValue, 'i'))
                                        )
                                        .map((tag) => {
                                            return (
                                                <li
                                                    key={tag}
                                                    data-id={tag}
                                                    onClick={() =>
                                                        selectTag(tag)
                                                    }
                                                    className={
                                                        styles[
                                                            'tags-suggestions-list'
                                                        ]
                                                    }
                                                >
                                                    {tag}
                                                </li>
                                            );
                                        })}
                                </ul>
                            </div>
                        )}
                    </div>
                    <div className={styles['tags-list']}>
                        {tagList.map((tag, i) => {
                            return (
                                <div key={i}>
                                    <span>{tag}</span>
                                    <button
                                        onClick={() => removeTag(tag)}
                                    ></button>
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

function DropzoneArea({ onDropFiles, files, lang, removeFile }) {
    const {
        getRootProps,
        getInputProps,
        open,
        isDragActive,
        isDragAccept,
        isDragReject,
    } = useDropzone({
        accept: 'image/png, image/jpg, image/jpeg',
        maxSize: 2097152,
        multiple: true,
        onDrop: (acceptedFiles) => {
            onDropFiles(
                acceptedFiles.map((file) =>
                    Object.assign(file, {
                        preview: URL.createObjectURL(file),
                    })
                )
            );
        },
    });

    const baseStyle = {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        borderWidth: 2,
        borderRadius: 2,
        borderColor: '#eeeeee',
        borderStyle: 'dashed',
        backgroundColor: '#fafafa',
        color: '#bdbdbd',
        outline: 'none',
        transition: 'border .24s ease-in-out',
    };

    const activeStyle = {
        borderColor: '#2196f3',
    };

    const acceptStyle = {
        borderColor: '#00e676',
    };

    const rejectStyle = {
        borderColor: '#ff1744',
    };
    const style = useMemo(
        () => ({
            ...baseStyle,
            ...(isDragActive ? activeStyle : {}),
            ...(isDragAccept ? acceptStyle : {}),
            ...(isDragReject ? rejectStyle : {}),
        }),
        [isDragActive, isDragReject, isDragAccept]
    );

    return (
        <div>
            <div className={styles['new-product-info-images-title']}>
                <h3>
                    {lang['PRODUCTS_NEW_IMAGES_TITLE']} {'  '}{' '}
                    <small className={styles['new-product-required']}>
                        {lang['PRODUCTS_NEW_REQUIRED']}
                    </small>
                </h3>
                {/* <button className={styles['add-button']} onClick={open}>
                    {lang['PRODUCTS_NEW_IMAGES_UPLOAD']}
                </button> */}
            </div>

            <div>
                <input {...getInputProps()} />
                {/* {files.length === 0 && (
                    
                )} */}
                <div {...getRootProps({ style })}>
                    <p>
                        Seleccione o Arrastre las imagenes que desea asignar al
                        producto.
                    </p>
                    <div className={styles['new-product-info-images-grid']}>
                        {files.map((file, key) => {
                            return (
                                <div key={'anchor-' + file.name + key}>
                                    <Badge.Anchor>
                                        <Badge
                                            size="mini"
                                            type="secondary"
                                            onClick={(e) => {
                                                removeFile(key);
                                                e.stopPropagation();
                                            }}
                                        >
                                            <img src="./../static/icons/x.svg"></img>
                                        </Badge>
                                        <Avatar
                                            src={file.preview}
                                            size="large"
                                            isSquare={true}
                                            onClick={(e) => {
                                                e.stopPropagation(); //ESTO SE CAMBIARA POR EL ORDER
                                            }}
                                        />
                                    </Badge.Anchor>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
