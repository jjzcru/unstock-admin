import React, { useState, useContext, useMemo, useCallback } from 'react';

import { useRouter } from 'next/router';
import styles from './new.module.css';

import { Sidebar } from '@components/Sidebar';
import { Navbar } from '@components/Navbar';
import { GetTags, GetProducts } from '@domain/interactors/ProductsUseCases';

import { useDropzone } from 'react-dropzone';

import {
    Avatar,
    Badge,
    Card,
    Divider,
    Button,
    Text,
    Spacer,
    Modal,
    Input,
} from '@zeit-ui/react';
import { Trash2, Delete } from '@geist-ui/react-icons';
import { v4 as uuidv4 } from 'uuid';

import lang from '@lang';
import { useSession, getSession } from 'next-auth/client';

export async function getServerSideProps(ctx) {
    const session = await getSession(ctx);
    if (!session) {
        ctx.res.writeHead(302, { Location: '/' }).end();
        return;
    }
    const storeId = 'f2cf6dde-f6aa-44c5-837d-892c7438ed3d'; // I get this from a session
    let tags = [];
    let vendors = [];
    let id = null;
    try {
        const getTags = new GetTags(storeId);
        const getProducts = new GetProducts(storeId);
        tags = await getTags.execute();
        const products = await getProducts.execute();
        vendors = [...new Set(products.map((item) => item.vendor))];
        id = ctx.params;
    } catch (e) {
        console.error(e);
    }
    return {
        props: { storeId, lang, tags, vendors, id }, // will be passed to the page component as props
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

    onSave = (data, id) => {
        this.setState((prevState) => ({
            loading: !prevState.loading,
        }));
        const { storeId } = this.props;
        fetch(`/api/products/${id}`, {
            method: 'put',
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
                if (data.variants.length) {
                    const variants = await this.sendVariants({
                        productId: body.product.id,
                        variants: { variants: data.variants },
                        storeId,
                    });
                    console.log(variants);

                    // if (variants.length > 0) {
                    //     const variantsImages = await this.sendVariantsImages({
                    //         productId: body.product.id,
                    //         variantImages: data.variants.map((values)=>{

                    //         }),
                    //         storeId,
                    //     });
                    // }
                }
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
            xhr.open('PUT', `/api/products/images/${productId}`);
            xhr.setRequestHeader('x-unstock-store', storeId);
            xhr.send(formData);
        });
    };

    sendVariants = ({ productId, variants, storeId }) => {
        console.log(variants);
        return new Promise((resolve, reject) => {
            fetch(`/api/products/variants/${productId}`, {
                method: 'put',
                headers: {
                    'Content-Type': 'application/json',
                    'x-unstock-store': storeId,
                },
                body: JSON.stringify(variants),
            })
                .then((res) => {
                    console.log(res);

                    resolve(res.json());
                })
                .catch((e) => {
                    console.log(e); //MOSTRAR MENSAJE AL USUARIO
                    reject();
                });
        });
    };

    render() {
        const { lang, tags, vendors, storeId, id } = this.props;
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
                                id={id}
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
        const { tags } = props;
        this.state = {
            // storeId: '7c3ec282-1822-469f-86d6-90ce3ef9e63e',
            name: '',
            price: 0,
            compareAt: 0,

            sku: '',
            barcode: '',
            inventoryPolicy: 'block',
            quantity: 0,

            shippingWeight: '',
            fullfilment: null,

            category: [],
            vendor: '',
            showVendors: false,
            tagInput: '',
            tags,
            tagList: [],
            files: [],

            disableButton: false,
            showVariantImagesModal: false,
            variants: [],
            cols: [
                {
                    name: 'Image',
                    row: 'images',
                    type: 'text',
                    locked: true,
                },
                { name: 'sku', row: 'sku', type: 'text', locked: true },
                {
                    name: 'Pricing',
                    row: 'pricing',
                    type: 'number',
                    locked: true,
                },
                {
                    name: 'Quantity',
                    row: 'quantity',
                    type: 'number',
                    locked: true,
                },
            ],
            selectedVariant: 0,
        };
    }

    componentDidMount() {
        const { id, tags } = this.props;
        this.getProduct(id.id)
            .then((product) => {
                console.log(product);
                this.setState({
                    name: product.title,
                    vendor: product.vendor,
                    tags: tags,
                    tagList: product.tags,
                    // quantity: product.variants[0].quantity,
                    // price: product.variants[0].price,
                    // barcode: product.variants[0].barcode,
                    files: product.images.map((file) => {
                        return {
                            name: file.id,
                            preview: file.image,
                            buffer: null,
                            id: file.id,
                        };
                    }),
                });
                if (product.option_1 !== null) {
                    let cols = this.state.cols;
                    cols.push({
                        name: product.option_1,
                        row: 'option_1',
                        type: 'text',
                        locked: true,
                    });
                    this.setState({ cols: cols });
                }
                if (product.option_2 !== null) {
                    let cols = this.state.cols;
                    cols.push({
                        name: product.option_2,
                        row: 'option_2',
                        type: 'text',
                        locked: true,
                    });
                    this.setState({ cols: cols });
                }
                if (product.option_3 !== null) {
                    let cols = this.state.cols;
                    cols.push({
                        name: product.option_3,
                        row: 'option_3',
                        type: 'text',
                        locked: true,
                    });
                    this.setState({ cols: cols });
                }

                this.setState({
                    variants: product.variants.map((value) => {
                        value.images = value.images.map((img) => {
                            return img.product_image_id;
                        });
                        if (value.option_1 === null) delete value.option_1;
                        if (value.option_2 === null) delete value.option_2;
                        if (value.option_3 === null) delete value.option_3;
                        delete value.barcode;
                        return value;
                    }),
                });
            })
            .catch(console.error);
    }

    getProduct = async (id) => {
        let query = await fetch(`/api/products/${id}`, {
            method: 'GET',
            headers: {
                'x-unstock-store': localStorage.getItem('storeId'),
            },
        });
        const data = await query.json();
        return data.product;
    };

    onDeleteProduct = async (id) => {
        this.setState((prevState) => ({
            loading: !prevState.loading,
        }));
        const { storeId } = this.props;
        fetch(`/api/products/${id.id}`, {
            method: 'delete',
            headers: {
                'Content-Type': 'application/json',
                'x-unstock-store': storeId,
            },
        })
            .then((res) => res.json())
            .then(async (body) => {
                window.location.href = '/products';
            })
            .catch(() => {
                console.log('error borrando producto'); //MOSTRAR MENSAJE AL USUARIO
                this.setState((prevState) => ({
                    loading: !prevState.loading,
                }));
            });
    };

    handleUpdateProduct = () => {
        const {
            id: { id },
        } = this.props;
        const { onSave } = this.context;
        const product = this.state;
        product.tags = this.state.tagList;
        product.images = this.state.files;
        console.log(product);

        // product.variants = product.variants.map((values) => {
        //     console.log(values);
        //     // values.option_1 = values[Object.keys(values)[4]] || null;
        //     // values.option_2 = values[Object.keys(values)[5]] || null;
        //     // values.option_3 = values[Object.keys(values)[6]] || null;
        //     // values.price = values.pricing;
        //     // delete values.pricing;
        //     //delete values.images;
        //     return values;
        // });

        // onSave(product, id);
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

    removeFile = (id) => {
        let { files, variants } = this.state;
        files = files.filter((file, key) => file.id !== id);

        variants = variants.map((element) => {
            element.images = element.images.filter((e) => e !== id);
            return element;
        });

        this.setState({ files: files, variants: variants });
    };

    onDrop = async (incommingFiles) => {
        const { files } = this.state;
        for (let file of incommingFiles) {
            if (files.length < 4)
                files.push({
                    name: file.name,
                    buffer: await this.fileToBinary(file),
                    preview: file.preview,
                    id: uuidv4(),
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

    toggleVariantsImages = () => {
        this.setState({ showVariantImagesModal: false });
    };

    saveVariantsImages = (images) => {
        console.log(images);
    };

    addVariant = () => {
        let { variants, cols } = this.state;
        console.log(cols[4]);
        let initialValue = { images: [], sku: '', pricing: 0.0, quantity: 0 };
        if (cols[4] && cols[4].name !== null) initialValue[cols[4].row] = '';
        if (cols[5] && cols[5].name !== null) initialValue[cols[5].row] = '';
        if (cols[6] && cols[6].name !== null) initialValue[cols[6].row] = '';

        variants.push(initialValue);
        this.setState({ variants: variants });
    };

    removeVariant = (value) => {
        let { variants } = this.state;
        variants = variants.filter((element, index) => {
            return index !== value;
        });
        this.setState({ variants: variants, selectedVariant: 0 });
    };

    selectImages = (row) => {
        this.setState({ showVariantImagesModal: true, selectedVariant: row });
    };

    updateValue = (index, field, value) => {
        let { variants } = this.state;
        let element = variants[index];
        element[field] = value;
        variants[index] = element;
        this.setState({ variants: variants });
    };

    addType = () => {
        let { variants, cols } = this.state;
        if (cols.length < 7) {
            let optionName = null;
            if (
                cols.find((value) => {
                    return value.row === 'option_1';
                }) === undefined
            ) {
                optionName = 'option_1';
            } else if (
                cols.find((value) => {
                    return value.row === 'option_2';
                }) === undefined
            ) {
                optionName = 'option_2';
            } else if (
                cols.find((value) => {
                    return value.row === 'option_3';
                }) === undefined
            ) {
                optionName = 'option_3';
            }

            cols.push({
                name: '',
                row: optionName,
                type: 'text',
                locked: false,
            });

            variants = variants.map((values) => {
                return { ...values, [optionName]: '' };
            });
            this.setState({ cols: cols, variants: variants });
        }
    };

    updateType = (field, index, value) => {
        let { cols } = this.state;
        let element = cols[index];
        element['name'] = value;
        cols[index] = element;
        this.setState({ cols: cols });
    };

    removeType = (value, col) => {
        let { cols, variants } = this.state;
        console.log(col);
        cols = cols.filter((element, index) => {
            return index !== col;
        });

        variants = variants.map((values) => {
            delete values[value.row];
            return { ...values };
        });

        this.setState({ cols: cols, variants: variants });
    };

    selectImageForVariant = (image, variant) => {
        let { variants } = this.state;
        variants[variant].images.push(image);
        this.setState({ variants: variants });
    };

    removeImageFromVariant = (image, variant) => {
        let { variants } = this.state;
        variants[variant].images = variants[variant].images.filter((value) => {
            return value !== image;
        });
        this.setState({ variants: variants });
    };

    getImageByID = (id) => {
        let { files } = this.state;
        let file = files.find((value) => {
            return value.id === id;
        });
        return file;
    };

    render() {
        const { lang } = this.context;
        const { id, loading } = this.props;
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
            //IMPROVEMENTS
            showVariantImagesModal,
            variants,
            cols,
            selectedVariant,
        } = this.state;

        return (
            <div>
                <VariantImages
                    images={files}
                    variants={variants}
                    selectedVariant={selectedVariant}
                    showModal={showVariantImagesModal}
                    toggleModal={this.toggleVariantsImages}
                    saveImages={this.saveVariantsImages}
                    addImage={this.selectImageForVariant}
                    removeImage={this.removeImageFromVariant}
                />
                <div className={styles['grid-container']}>
                    <div>
                        <div>
                            <div className={styles['top-bar']}>
                                <div className={styles['new-product-title']}>
                                    <button> &lt; Products</button>
                                    <h3>{lang['PRODUCTS_EDIT_TITLE']}</h3>
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

                                {/* <Pricing
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
                            /> */}
                                <div className={styles['variants']}>
                                    <Variants
                                        variants={variants}
                                        cols={cols}
                                        addVariant={this.addVariant}
                                        removeVariant={this.removeVariant}
                                        addType={this.addType}
                                        selectImages={this.selectImages}
                                        updateValue={this.updateValue}
                                        updateType={this.updateType}
                                        removeType={this.removeType}
                                        getImageByID={this.getImageByID}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div>
                            <Button
                                shadow
                                type="secondary"
                                onClick={() => this.handleUpdateProduct()}
                                loading={loading}
                                disabled={
                                    this.state.name.length === 0 ||
                                    this.state.files.length < 1 ||
                                    loading
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
                        <div>
                            <Card width="100%">
                                <Card.Content>
                                    <Text b> {lang['PRODUCT_ACTIONS']}</Text>
                                </Card.Content>
                                <Divider y={0} />
                                <Card.Content
                                    className={styles['product-actions']}
                                >
                                    <Spacer y={0.5} />
                                    <Button
                                        size="large"
                                        type="error"
                                        ghost
                                        onClick={() => this.onDeleteProduct(id)}
                                        loading={loading}
                                        disabled={loading}
                                    >
                                        {lang['PRODUCT_ACTIONS_DELETE']}
                                    </Button>
                                    <Spacer y={0.5} />
                                </Card.Content>
                            </Card>
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

function Variants({
    variants,
    cols,
    addVariant,
    removeVariant,
    addType,
    selectImages,
    updateValue,
    updateType,
    removeType,
    getImageByID,
}) {
    const { lang } = useContext(DataContext);

    return (
        <div>
            {' '}
            <h3>{lang['PRODUCTS_NEW_VARIANTS_TITLE']}</h3>
            <div className={styles['products']}>
                <table className={styles['products-table']}>
                    <thead className={styles['products-table-header']}>
                        <tr>
                            {cols.map((value, index) => {
                                if (!value.locked) {
                                    return (
                                        <th
                                            className={
                                                styles['variants-table-center']
                                            }
                                            key={'col' + index}
                                        >
                                            {
                                                <Input
                                                    iconClickable={true}
                                                    iconRight={
                                                        <Trash2 color="red" />
                                                    }
                                                    value={value.name}
                                                    onChange={(e) =>
                                                        updateType(
                                                            value,
                                                            index,
                                                            e.target.value
                                                        )
                                                    }
                                                    onIconClick={() =>
                                                        removeType(value, index)
                                                    }
                                                />
                                            }
                                        </th>
                                    );
                                } else {
                                    if (
                                        value.row === 'option_1' ||
                                        value.row === 'option_2' ||
                                        value.row === 'option_3'
                                    ) {
                                        return (
                                            <th
                                                className={
                                                    styles[
                                                        'variants-table-center'
                                                    ]
                                                }
                                                key={'col' + index}
                                            >
                                                {
                                                    <Input
                                                        value={value.name}
                                                        onChange={(e) =>
                                                            updateType(
                                                                value,
                                                                index,
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                }
                                            </th>
                                        );
                                    } else {
                                        return (
                                            <th
                                                className={
                                                    styles[
                                                        'variants-table-center'
                                                    ]
                                                }
                                                key={'col' + index}
                                            >
                                                {value.name}
                                            </th>
                                        );
                                    }
                                }
                            })}
                            {cols.length < 7 && (
                                <th className={styles['variants-table-center']}>
                                    <Button
                                        auto
                                        size="small"
                                        className={
                                            styles['variants-table-buttons']
                                        }
                                        onClick={() => addType()}
                                    >
                                        <img
                                            className={styles['icon']}
                                            src={'/static/icons/plus.svg'}
                                        />
                                    </Button>
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {variants.map((value, index) => {
                            return (
                                <VariantRow
                                    values={value}
                                    row={index}
                                    removeVariant={removeVariant}
                                    selectImages={selectImages}
                                    key={'row' + index}
                                    updateValue={updateValue}
                                    getImageByID={getImageByID}
                                />
                            );
                        })}
                    </tbody>
                </table>

                <Button
                    auto
                    size="small"
                    className={styles['variants-add-buttons']}
                    onClick={() => addVariant()}
                >
                    <img
                        className={styles['icon']}
                        src={'/static/icons/plus.svg'}
                    />
                </Button>
            </div>
        </div>
    );
}

function VariantRow({
    values,
    row,
    removeVariant,
    selectImages,
    updateValue,
    getImageByID,
}) {
    let img = {};
    if (values.images.length > 0) {
        img = getImageByID(values.images[0]);
    }
    return (
        <tr className={styles['product-row']}>
            <td
                className={styles['variants-table-center']}
                onClick={() => selectImages(row)}
            >
                {values.images.length > 0 && img ? (
                    <Badge.Anchor>
                        <Badge>{values.images.length}</Badge>
                        <Avatar src={img.preview} isSquare />
                    </Badge.Anchor>
                ) : (
                    <Avatar isSquare />
                )}
            </td>

            {Object.keys(values).map((value, index) => {
                if (value !== 'images' && value !== 'id') {
                    return (
                        <td
                            className={styles['variants-table-center']}
                            key={'row-' + value + '-' + index}
                        >
                            <Input
                                value={values[value]}
                                onChange={(e) =>
                                    updateValue(row, value, e.target.value)
                                }
                            />
                        </td>
                    );
                }
            })}

            <td className={styles['variants-table-center']}>
                <Button
                    className={styles['variants-table-buttons']}
                    iconRight={<Delete color="red" />}
                    auto
                    size="small"
                    onClick={() => removeVariant(row)}
                />
            </td>
        </tr>
    );
}

function VariantImages({
    images,
    variants,
    selectedVariant,
    showModal,
    toggleModal,
    saveImages,
    addImage,
    removeImage,
}) {
    let ImageRender = [];
    images.forEach((element, index) => {
        if (variants.length > 0) {
            if (
                variants[selectedVariant].images.find((value) => {
                    return value === element.id;
                })
            ) {
                let imgNumber = variants[selectedVariant].images.findIndex(
                    (value, index) => {
                        return value === element.id;
                    }
                );

                ImageRender.push(
                    <div key={'image-' + index}>
                        <Badge.Anchor>
                            <Badge
                                size="mini"
                                type="secondary"
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                            >
                                {imgNumber + 1}
                            </Badge>
                            <Avatar
                                src={element.preview}
                                size="large"
                                isSquare={true}
                                onClick={(e) => {
                                    removeImage(element.id, selectedVariant);
                                }}
                            />
                        </Badge.Anchor>
                    </div>
                );
            } else {
                ImageRender.push(
                    <div key={'image-' + index}>
                        <Avatar
                            src={element.preview}
                            size="large"
                            isSquare={true}
                            onClick={(e) => {
                                addImage(element.id, selectedVariant);
                            }}
                        />
                    </div>
                );
            }
        }
    });

    return (
        <Modal open={showModal} onClose={toggleModal}>
            <Modal.Title>Imagenes de Variante</Modal.Title>
            <Modal.Content>
                {images.length === 0 ? (
                    <p>Ninguna imagen asignada al producto</p>
                ) : (
                    <div className={styles['new-product-info-images-box']}>
                        {ImageRender}
                    </div>
                )}
            </Modal.Content>
            <Modal.Action passive onClick={(e) => toggleModal()}>
                Cerrar
            </Modal.Action>
        </Modal>
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
                <h3>{lang['PRODUCTS_NEW_IMAGES_TITLE']}</h3>
            </div>

            <div>
                <input {...getInputProps()} />

                <div {...getRootProps({ style })}>
                    <p>
                        Seleccione o Arrastre las imagenes que desea asignar al
                        producto.
                    </p>
                    <div className={styles['new-product-info-images-box']}>
                        {files.map((file, key) => {
                            return (
                                <div key={'anchor-' + file.name + key}>
                                    <Badge.Anchor>
                                        <Badge
                                            size="mini"
                                            type="secondary"
                                            onClick={(e) => {
                                                removeFile(file.id);
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
