import React, { useState, useContext, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useSession, getSession } from 'next-auth/client';
import styles from './new.module.css';

import { Sidebar } from '@components/Sidebar';
import { Navbar } from '@components/Navbar';
import { GetTags, GetProducts } from '@domain/interactors/ProductsUseCases';

import { useDropzone } from 'react-dropzone';

import { Avatar, Badge, Button, Modal, Input } from '@zeit-ui/react';
import { Trash2, Delete } from '@geist-ui/react-icons';
import lang from '@lang';
import { v4 as uuidv4 } from 'uuid';

export async function getServerSideProps(ctx) {
    // Copy paste de esto excepto en home, solamente en pages
    const session = await getSession(ctx);
    if (!session) {
        ctx.res.writeHead(302, { Location: '/' }).end();
        return;
    }
    // Hasta aqui

    // Sacas el store del session
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
        // const { storeId } = this.props;
        this.saveProduct(data)
            .then(() => {
                window.location.href = '/products';
            })
            .catch((e) => {
                console.log(e); //MOSTRAR MENSAJE AL USUARIO
                this.setState((prevState) => ({
                    loading: !prevState.loading,
                }));
            });
    };

    saveProduct = async (data) => {
        const { storeId } = this.props;
        // 1. Create product
        const product = await this.createProduct(data);
        const { id } = product;
        // 2. Upload image
        const imagesMap = await this.uploadImages({
            images: data.images,
            productId: id,
        });
        // 3. Create variants
        const variants = await this.sendVariants({
            productId: id,
            variants: data.variants,
            storeId,
        });
        // 4. Link variant image
        await this.sendVariantsImages({
            productId: id,
            storeId,
            imagesMap,
            variants,
        });
    };

    createProduct = async (data) => {
        const { storeId } = this.props;
        const res = await fetch('/api/products', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'x-unstock-store': storeId,
            },
            body: JSON.stringify(data),
        });
        return (await res.json()).product;
    };

    uploadImages = async ({ images, productId }) => {
        const { storeId } = this.props;
        const imagesMap = {};
        const promises = [];

        for (let imageFile of images) {
            promises.push(
                new Promise(async (resolve, reject) => {
                    try {
                        const formData = new FormData();
                        let contentLength = 0;
                        const { name, buffer, id } = imageFile;
                        const blob = new Blob([buffer]);
                        contentLength += blob.size;
                        formData.append('image', blob, name);

                        const uploadedImages = await this.sendImages({
                            formData,
                            productId,
                            storeId,
                        });

                        if (uploadedImages && uploadedImages.length) {
                            imagesMap[id] = uploadedImages[0]['id'];
                        }
                        resolve();
                    } catch (e) {
                        reject(e);
                    }
                })
            );
        }

        await Promise.all(promises);

        return imagesMap;
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

    sendVariants = async ({ productId, variants, storeId }) => {
        const uploadedVariants = [];
        for (let variant of variants) {
            const body = {
                variants: [variant],
            };

            let res = await fetch(`/api/products/variants/${productId}`, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                    'x-unstock-store': storeId,
                },
                body: JSON.stringify(body),
            });
            res = await res.json();

            const response = res.data[0];
            response.images = variant.images;
            uploadedVariants.push(response);
        }

        return uploadedVariants;
    };

    sendVariantsImages = async ({
        productId,
        variants,
        storeId,
        imagesMap,
    }) => {
        const promises = [];
        for (let variant of variants) {
            const { id, images } = variant;
            for (let image of images) {
                promises.push(
                    fetch(`/api/products/variants/images/${productId}`, {
                        method: 'post',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-unstock-store': storeId,
                        },
                        body: JSON.stringify({
                            variantImages: [
                                {
                                    productVariantId: id,
                                    productImageId: imagesMap[image],
                                },
                            ],
                        }),
                    })
                );
            }
        }
        return await Promise.all(promises);
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
            showVariantImagesModal: false,
            variants: [
                {
                    images: [],
                    sku: '',
                    pricing: 0.0,
                    quantity: 0,
                },
            ],
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

        this.toggleVariantsImages = this.toggleVariantsImages.bind(this);
        this.saveVariantsImages = this.saveVariantsImages.bind(this);
        this.selectImageForVariant = this.selectImageForVariant.bind(this);
        this.removeImageFromVariant = this.removeImageFromVariant.bind(this);
    }

    handleCreateProduct = () => {
        const { onSave } = this.context;
        const product = this.state;
        const { tagList, files } = this.state;

        product.tags = tagList;
        product.images = files;
        product.variants = product.variants.map((values) => {
            values.option_1 = values[Object.keys(values)[4]] || '';
            values.option_2 = values[Object.keys(values)[5]] || '';
            values.option_3 = values[Object.keys(values)[6]] || '';
            values.price = values.pricing;
            delete values.pricing;
            //delete values.images;
            return values;
        });
        onSave(product);
    };

    validateFields = () => {
        // console.log('here');
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
        let initialValue = { images: [], sku: '', pricing: 0.0, quantity: 0 };
        cols.forEach((value, index) => {
            if (!value.locked) {
                initialValue[value.row] = '';
            }
        });
        variants.push(initialValue);
        this.setState({ variants: variants });
    };

    removeVariant = (value) => {
        let { variants } = this.state;
        variants = variants.filter((element, index) => {
            return index !== value;
        });
        this.setState({ variants: variants });
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
                                /> */}
                                <Shipping
                                    shippingWeight={shippingWeight}
                                    fullfilment={fullfilment}
                                    onChange={this.onShippingChange}
                                />
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
                                onClick={() => this.handleCreateProduct()}
                                loading={loading}
                                disabled={
                                    this.state.name.length === 0 ||
                                    this.state.files.length < 1
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
                                    return (
                                        <th
                                            className={
                                                styles['variants-table-center']
                                            }
                                            key={'col' + index}
                                        >
                                            {value.name}
                                        </th>
                                    );
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
                                    length={variants.length}
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
    length,
}) {
    console.log(length);
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
                {values.images.length > 0 ? (
                    <Badge.Anchor>
                        <Badge>{values.images.length}</Badge>
                        <Avatar src={img.preview} isSquare />
                    </Badge.Anchor>
                ) : (
                    <Avatar isSquare />
                )}
            </td>

            {Object.keys(values).map((value, index) => {
                if (index > 0) {
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
                    disabled={length === 1}
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
