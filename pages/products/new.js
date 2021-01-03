import React, { useState, useContext, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useSession, getSession } from 'next-auth/client';
import styles from './new.module.css';

import { Sidebar } from '@components/Sidebar';
import { Navbar } from '@components/Navbar';
import { GetTags, GetProducts } from '@domain/interactors/ProductsUseCases';

import { useDropzone } from 'react-dropzone';

import {
    Avatar,
    Badge,
    Button,
    Modal,
    Input,
    Card,
    Divider,
    Text,
} from '@geist-ui/react';
import { Trash2, Delete } from '@geist-ui/react-icons';
import lang from '@lang';
import { v4 as uuidv4 } from 'uuid';
import { getSessionData } from '@utils/session';

export async function getServerSideProps(ctx) {
    const session = await getSession(ctx);
    if (!session) {
        ctx.res.writeHead(302, { Location: '/' }).end();
        return;
    }
    const { storeId } = getSessionData(session);
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
        props: { storeId, lang, tags, vendors, session }, // will be passed to the page component as props
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
                variant: variant,
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

    sendVariantsImages = async ({ variants, storeId, imagesMap }) => {
        let promises = [];
        for (let variant of variants) {
            const { images } = variant;
            promises = [
                ...images.map((image, index) => {
                    return fetch(
                        `/api/products/variants/images/${variant.id}`,
                        {
                            method: 'post',
                            headers: {
                                'Content-Type': 'application/json',
                                'x-unstock-store': storeId,
                            },
                            body: JSON.stringify({
                                variantImage: {
                                    productImageId: imagesMap[image],
                                    position: index,
                                },
                            }),
                        }
                    );
                }),
                ...promises,
            ];
        }
        return await Promise.all(promises);
    };

    render() {
        const { lang, tags, vendors, storeId, session } = this.props;
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
                    <Navbar
                        lang={selectedLang}
                        userName={session.user.name}
                        storeName={'Unstock'}
                    />
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
            body: '',
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
            disableButton: false,
            showVariantImagesModal: false,
            variants: [
                {
                    images: [],
                    sku: '',
                    pricing: '1.00',
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
            slug: '',
            slugResult: { error: false, message: '' },
        };

        this.toggleVariantsImages = this.toggleVariantsImages.bind(this);
        this.selectImageForVariant = this.selectImageForVariant.bind(this);
        this.removeImageFromVariant = this.removeImageFromVariant.bind(this);
    }

    handleCreateProduct = () => {
        const { onSave } = this.context;
        const product = this.state;
        const { tagList, files, cols } = this.state;

        product.tags = tagList;
        product.images = files;

        if (cols[4]) {
            const colInfo = cols[4];
            if (colInfo.name.length === 0) {
                product.option_1 = 'Default';
            } else {
                product.option_1 = colInfo.name;
            }
        }

        if (cols[5]) {
            const colInfo = cols[5];
            product.option_2 = colInfo.name;
        }

        if (cols[6]) {
            const colInfo = cols[6];
            product.option_3 = colInfo.name;
        }

        product.variants = product.variants.map((values) => {
            if (values[Object.keys(values)[4]])
                values.option_1 = values[Object.keys(values)[4]];
            if (values[Object.keys(values)[5]])
                values.option_2 = values[Object.keys(values)[5]];
            if (values[Object.keys(values)[6]])
                values.option_3 = values[Object.keys(values)[6]];
            values.price = values.pricing;
            delete values.pricing;
            //delete values.images;
            return values;
        });

        console.log(product);
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

    onDescriptionChange = (description) => {
        this.setState({
            body: description,
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
        const { files, variants } = this.state;
        for (let file of incommingFiles) {
            files.push({
                name: file.name,
                buffer: await this.fileToBinary(file),
                preview: file.preview,
                id: uuidv4(),
            });
        }
        this.setState({ files });
        variants.map((variant, key) => {
            if (variant.images.length === 0) {
                this.selectImageForVariant(files[0].id, key);
            }
        });
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

    addVariant = () => {
        let { variants, cols, files } = this.state;
        let initialValue = {
            images: [],
            sku: '',
            pricing: '1.00',
            quantity: 0,
        };

        cols.forEach((value, index) => {
            if (!value.locked) {
                initialValue[value.row] = '';
            }
        });
        if (files.length > 0) {
            initialValue.images.push(files[0].id);
        }
        variants.push(initialValue);
        this.setState({ variants: variants });
        if (variants.length < 3) {
            this.addType();
        }
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
        if (
            field === 'pricing' &&
            !isNaN(value) &&
            value.toString().indexOf('.') != -1
        ) {
            const decimal = value.split('.')[1];
            if (decimal.length < 3) {
                element[field] = value;
            }
        } else {
            element[field] = value;
        }
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

    canRemoveType = (col) => {
        let { cols } = this.state;
        switch (col) {
            case 4:
                if (cols[5] || cols[6]) return true;
                else return false;
            case 5:
                if (cols[4] || cols[6]) return true;
                else return false;
            case 6:
                if (cols[4] || cols[5]) return true;
                else return false;
            default:
                return false;
        }
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

    validateEqualVariants = () => {
        let { variants } = this.state;
        let foundEqual = false;
        const validation = this.isVariantCombinationsValid(variants);
        return validation.invalidVariants.length > 0 ? true : false;
    };

    validateEqualSku = () => {
        let { variants } = this.state;
        let skus = variants.map((value) => {
            return value.sku;
        });

        const validation = this.isValidSkus(skus);
        return validation ? false : true;
    };

    isValidSkus(skus) {
        return Array.from(new Set(skus)).length === skus.length;
    }

    isVariantCombinationsValid(variants) {
        const validVariants = [];
        const invalidVariants = [];
        for (const variant of variants) {
            if (!validVariants.length) {
                validVariants.push(variant);
                continue;
            }

            if (this.isVariantValid(variant, validVariants)) {
                validVariants.push(variant);
            } else {
                invalidVariants.push(variant);
            }
        }

        return {
            validVariants,
            invalidVariants /* Si esto tiene algun length 
            entonces es invalido y muestras un error*/,
        };
    }

    isVariantValid(variant, validVariants) {
        for (const validVariant of validVariants) {
            if (
                variant.option_1 === validVariant.option_1 &&
                variant.option_2 === validVariant.option_2 &&
                variant.option_3 === validVariant.option_3
            ) {
                return false;
            }
        }
        return true;
    }

    isValidProduct = () => {
        const { name, variants, files, cols } = this.state;
        //  console.log({ name, variants, files, cols });
        // 1. El nombre no puede estar vacio
        if (name.length === 0) return true;

        // 2. El producto tiene que tener variants
        if (!variants || variants.length === 0) return true;

        // 3. Los varientes tiene que tener un precio
        // 9. Los varientes tiene que tener una cantidad
        for (const variant of variants) {
            if (
                isNaN(variant.pricing) ||
                variant.pricing < 0 ||
                variant.pricing.length === 0
            )
                return true;
            if (
                isNaN(variant.quantity) ||
                variant.quantity < 0 ||
                variant.quantity.length === 0
            )
                return true;
        }

        // 4. Si existe mas de un variante el option tiene
        // que tener titulo y el option 1 tiene que tener valor
        if (variants.length > 1) {
            if (cols[4] && cols[4].name.length === 0) return true;
        }

        // 5. Tiene que tener imagenes
        if (!files || files.length === 0) return true;

        // 6. Las varientes tiene que tener por lo menos una imagen
        for (const variant of variants) {
            if (variant.images.length === 0) return true;
        }

        // 7. Los variantes son iguales
        if (this.validateEqualVariants()) return true;

        // 8. Los SKU son iguales
        if (this.validateEqualSku()) return true;

        // 10. El titulo de options no puede repetirse
        if (cols[4] && cols[5] && cols[4].name === cols[5].name) return true;
        if (cols[4] && cols[6] && cols[4].name === cols[6].name) return true;
        if (cols[5] && cols[6] && cols[5].name === cols[6].name) return true;

        // 11. No puede haber options vacios
        for (const variant of variants) {
            if (cols[4]) {
                if (variant.option_1.length === 0) return true;
            }
            if (cols[5]) {
                if (variant.option_2.length === 0) return true;
            }
            if (cols[6]) {
                if (variant.option_3.length === 0) return true;
            }
        }

        // 12. Los titulos de options no pueden estar vacios

        if (cols[4]) {
            if (cols[4].name.length === 0) return true;
            for (const variant of variants) {
                if (variant.option_1 && variant.option_1.length === 0)
                    return true;
            }
        }

        if (cols[5]) {
            if (cols[5].name.length === 0) return true;
            for (const variant of variants) {
                if (variant.option_2 && variant.option_2.length === 0)
                    return true;
            }
        }

        if (cols[6]) {
            if (cols[6].name.length === 0) return true;
            for (const variant of variants) {
                if (variant.option_3 && variant.option_3.length === 0)
                    return true;
            }
        }

        return false;
    };

    loadErrors = () => {
        const { lang } = this.context;
        let errors = [];
        const { name, variants, files, cols } = this.state;

        if (name.length === 0) errors.push(lang['ERROR_INVALID_NAME']);

        if (!variants || variants.length === 0)
            errors.push(lang['ERROR_VARIANTS_LENGTH']);

        for (const variant of variants) {
            if (
                isNaN(variant.pricing) ||
                variant.pricing < 0 ||
                variant.pricing.length === 0
            )
                errors.push(lang['ERROR_VARIANT_PRICING']);

            if (
                isNaN(variant.quantity) ||
                variant.quantity < 0 ||
                variant.quantity.length === 0
            )
                errors.push(lang['ERROR_VARIANT_QTY']);
        }

        if (variants.length > 0) {
            if (cols[4] && cols[4].name.length === 0)
                errors.push(lang['ERROR_VARIANT_OPTION']);
            if (cols[5] && cols[5].name.length === 0)
                errors.push(lang['ERROR_VARIANT_OPTION']);
            if (cols[6] && cols[6].name.length === 0)
                errors.push(lang['ERROR_VARIANT_OPTION']);
        }

        if (!files || files.length === 0) {
            errors.push(lang['ERROR_NO_IMAGES']);
        } else {
            for (const variant of variants) {
                if (variant.images.length === 0)
                    errors.push(lang['ERROR_VARIANT_IMAGES']);
            }
        }

        if (this.validateEqualVariants())
            errors.push(lang['ERROR_COMBINATION']);

        if (this.validateEqualSku()) errors.push(lang['ERROR_SKU']);

        if (cols[4] && cols[5] && cols[4].name === cols[5].name)
            errors.push(lang['ERROR_VARIANT_OPTION_NAME']);
        if (cols[4] && cols[6] && cols[4].name === cols[6].name)
            errors.push(lang['ERROR_VARIANT_OPTION_NAME']);
        if (cols[5] && cols[6] && cols[5].name === cols[6].name)
            errors.push(lang['ERROR_VARIANT_OPTION_NAME']);

        for (const variant of variants) {
            if (cols[4]) {
                if (variant.option_1.length === 0) {
                    errors.push(lang['ERROR_VARIANT_EMPTY']);
                }
            }
            if (cols[5]) {
                if (variant.option_2.length === 0) {
                    errors.push(lang['ERROR_VARIANT_EMPTY']);
                }
            }
            if (cols[6]) {
                if (variant.option_3.length === 0) {
                    errors.push(lang['ERROR_VARIANT_EMPTY']);
                }
            }
        }
        return errors
            .map((item) => item)
            .filter((value, index, self) => self.indexOf(value) === index);
    };

    onChangeSlug = (value) => {
        const regex = new RegExp('^[a-z0-9-_]+$');
        if (value.length > 0) {
            if (regex.test(value)) {
                this.setState({ slug: value });
            } else {
                this.setState({
                    slugResult: { error: true, message: 'Slug Invalido' },
                });
            }
        } else {
            this.setState({ slug: '' });
        }
    };

    render() {
        const { lang } = this.context;
        const { loading } = this.props;
        let {
            name,
            body,
            vendor,
            showVendors,
            tags,
            tagInput,
            tagList,
            files,
            showVariantImagesModal,
            variants,
            cols,
            selectedVariant,
            slug,
            slugResult,
        } = this.state;

        const isProductValid = this.isValidProduct();

        return (
            <div>
                <VariantImages
                    images={files}
                    variants={variants}
                    selectedVariant={selectedVariant}
                    showModal={showVariantImagesModal}
                    toggleModal={this.toggleVariantsImages}
                    addImage={this.selectImageForVariant}
                    removeImage={this.removeImageFromVariant}
                />
                <div className={styles['grid-container']}>
                    <div>
                        <div>
                            <div className={styles['top-bar']}>
                                <div className={styles['new-product-title']}>
                                    <Link href="/products">
                                        <div>
                                            <button>
                                                {' '}
                                                &lt; {lang['PRODUCTS']}
                                            </button>
                                        </div>
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

                                <Description
                                    description={body}
                                    onChange={this.onDescriptionChange}
                                />
                                <ProductSlug
                                    slug={slug}
                                    onChange={this.onChangeSlug}
                                    result={slugResult}
                                />
                                <Images
                                    onDrop={this.onDrop}
                                    files={files}
                                    buttonClick={this.onLoadImageButton}
                                    removeFile={this.removeFile}
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
                                        canRemoveType={this.canRemoveType}
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
                                disabled={isProductValid}
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
                        {this.loadErrors().length > 0 && !loading && (
                            <div>
                                <Card width="100%">
                                    <Card.Content>
                                        <Text b>Errores creando producto</Text>
                                    </Card.Content>
                                    <Divider y={0} />
                                    <Card.Content
                                        className={styles['product-actions']}
                                    >
                                        <ol>
                                            {this.loadErrors().map(
                                                (value, index) => {
                                                    return (
                                                        <li key={index}>
                                                            {value}
                                                        </li>
                                                    );
                                                }
                                            )}
                                        </ol>
                                    </Card.Content>
                                </Card>
                            </div>
                        )}
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
            <h3>
                {lang['PRODUCTS_NEW_TITLE_LABEL']}
                {'  '}{' '}
                <small className={styles['new-product-required']}>
                    {lang['PRODUCTS_NEW_REQUIRED']}
                </small>
            </h3>{' '}
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

function Description({ description, onChange }) {
    const { lang } = useContext(DataContext);
    return (
        <div className={styles['new-product-info-description']}>
            <h3>{lang['PRODUCTS_NEW_DESCRIPTION']}</h3>
            <div>
                <textarea
                    className={styles['new-product-info-description-input']}
                    rows="3"
                    value={description}
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

function ProductSlug({ slug, onChange, result }) {
    const { lang } = useContext(DataContext);
    console.log(result);
    return (
        <div className={styles['new-product-info-title']}>
            <h3>
                {lang['SLUG']}
                {'  '}{' '}
                <small className={styles['new-product-required']}>
                    {lang['SLUG_DESCRIPTION']}
                </small>
            </h3>{' '}
            <div>
                <input
                    type="text"
                    className={styles['new-product-info-title-input']}
                    value={slug}
                    onChange={(e) => onChange(e.target.value)}
                />
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
    canRemoveType,
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
                                                        canRemoveType(
                                                            index
                                                        ) && (
                                                            <Trash2 color="red" />
                                                        )
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
                                            {lang[value.name.toUpperCase()]}
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
                if (value !== 'id' && value !== 'images') {
                    let onChange;

                    if (value === 'pricing') {
                        onChange = (e) => {
                            if (!isNaN(e.target.value)) {
                                updateValue(row, value, e.target.value);
                            }
                        };
                    }

                    if (value === 'quantity') {
                        onChange = (e) => {
                            if (!isNaN(e.target.value)) {
                                updateValue(
                                    row,
                                    value,
                                    isNaN(parseInt(e.target.value))
                                        ? 0
                                        : parseInt(e.target.value)
                                );
                            }
                        };
                    }

                    if (value !== 'pricing' && value !== 'quantity') {
                        onChange = (e) => {
                            updateValue(row, value, e.target.value);
                        };
                    }

                    return (
                        <td
                            className={styles['variants-table-center']}
                            key={'row-' + value + '-' + index}
                        >
                            <Input value={values[value]} onChange={onChange} />
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

                                    {tags &&
                                        tags
                                            .filter((tag) =>
                                                tag.match(
                                                    new RegExp(tagValue, 'i')
                                                )
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
