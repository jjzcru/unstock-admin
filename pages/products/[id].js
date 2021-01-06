import React, { useState, useContext, useMemo, useCallback } from 'react';

import { useRouter } from 'next/router';
import styles from './new.module.css';

import Link from 'next/link';

import { Sidebar } from '@components/Sidebar';
import { Navbar } from '@components/Navbar';
//import { GetTags, GetProducts } from '@domain/interactors/ProductsUseCases';

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
    Loading,
} from '@geist-ui/react';
import { Trash2, Delete } from '@geist-ui/react-icons';
import { v4 as uuidv4 } from 'uuid';

import lang from '@lang';
import { getSession } from 'next-auth/client';
import { getSessionData } from '@utils/session';

export async function getServerSideProps(ctx) {
    const session = await getSession(ctx);
    if (!session) {
        ctx.res.writeHead(302, { Location: '/' }).end();
        return;
    }
    const { storeId } = getSessionData(session);
    let id = ctx.params;

    return {
        props: { storeId, lang, id, session }, // will be passed to the page component as props
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
        this.saveProduct(data, id)
            .then(() => {
                this.setState((prevState) => ({
                    loading: !prevState.loading,
                }));
                window.location.href = '/products';
            })
            .catch((e) => {
                console.log(e);
                this.setState((prevState) => ({
                    loading: !prevState.loading,
                }));
            });
    };

    saveProduct = async (data, id) => {
        const { storeId } = this.props;
        // 1. update product
        const product = await this.updateProduct(data, id);
        // 2. Upload image
        const imagesMap = await this.uploadImages({
            images: data.imagesToAdd,
            productId: id,
        });

        if (data.images.length > 0) {
            for (const image of data.images) {
                imagesMap[image.id] = image.id;
            }
        }

        // DELETE IMAGES
        await this.deleteImage({
            images: data.imagesToDelete,
        });

        // 3.  variants
        const addedVariants = await this.addVariants({
            productId: id,
            variants: data.variantsToAdd,
            storeId,
        });

        if (addedVariants.length > 0) {
            for (const added of addedVariants) {
                for (
                    let imageIndex = 0;
                    imageIndex < added.images.length;
                    imageIndex++
                ) {
                    await this.addVariantsImages({
                        productId: id,
                        storeId,
                        productVariant: added.id,
                        imageVariant: imagesMap[added.images[imageIndex]],
                        position: imageIndex,
                    });
                }
            }
        }

        const updatedVariants = await this.updateVariants({
            variants: data.variantsToUpdate,
            storeId,
        });
        if (updatedVariants.length > 0) {
            let toDelete = [];
            let toCreate = [];
            for (const updated of updatedVariants) {
                const find = data.originalVariants.find((value) => {
                    return value.id === updated.id;
                });
                if (
                    JSON.stringify(updated.images) !==
                    JSON.stringify(find.images)
                ) {
                    for (const updateImage of updated.images) {
                        const findImage = find.images.find((value) => {
                            return updateImage === value;
                        });
                        if (!findImage) {
                            toCreate.push({
                                productImageId: imagesMap[updateImage],
                                productVariantId: updated.id,
                            });
                        }
                    }
                    for (const originalImage of find.images) {
                        const findImage = updated.images.find((value) => {
                            return originalImage === value;
                        });
                        if (!findImage) {
                            toDelete.push({
                                productImageId: originalImage,
                                productVariantId: updated.id,
                            });
                        }
                    }
                }
            }

            for (const remove of toDelete) {
                await this.removeVariantsImages({
                    productVariant: remove.productVariantId,
                    productImageId: remove.productImageId,
                    storeId,
                });
            }

            for (const add of toCreate) {
                await this.addVariantsImages({
                    storeId,
                    productVariant: add.productVariantId,
                    imageVariant: imagesMap[add.productImageId],
                });
            }
        }

        await this.removeVariants({
            variants: data.variantsToRemove,
        });
    };

    updateProduct = async (data, id) => {
        const { storeId } = this.props;
        const res = await fetch(`/api/products/${id}`, {
            method: 'put',
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

    deleteImage = async (images) => {
        const { storeId } = this.props;
        for (let imageFile of images.images) {
            let res = await fetch(`/api/products/images/${imageFile}`, {
                method: 'delete',
                headers: {
                    'Content-Type': 'application/json',
                    'x-unstock-store': storeId,
                },
            });

            res = await res.json();
        }
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

    addVariants = async ({ productId, variants, storeId }) => {
        const uploadedVariants = [];
        for (let variant of variants) {
            const body = {
                variant,
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

    updateVariants = async ({ variants, storeId }) => {
        const updatedVariants = [];
        for (let variant of variants) {
            const body = {
                variant,
            };
            let res = await fetch(`/api/products/variants/${variant.id}`, {
                method: 'put',
                headers: {
                    'Content-Type': 'application/json',
                    'x-unstock-store': storeId,
                },
                body: JSON.stringify(body),
            });
            res = await res.json();

            const response = res.data[0];
            response.images = variant.images;
            updatedVariants.push(response);
        }

        return updatedVariants;
    };

    removeVariants = async ({ variants }) => {
        const { storeId } = this.props;
        for (let variant of variants) {
            let res = await fetch(`/api/products/variants/${variant}`, {
                method: 'delete',
                headers: {
                    'Content-Type': 'application/json',
                    'x-unstock-store': storeId,
                },
            });

            res = await res.json();
        }
    };

    addVariantsImages = async ({
        storeId,
        productVariant,
        imageVariant,
        position,
    }) => {
        console.log({
            storeId,
            productVariant,
            imageVariant,
            position,
        });
        let res = await fetch(
            `/api/products/variants/images/${productVariant}`,
            {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                    'x-unstock-store': storeId,
                },
                body: JSON.stringify({
                    variantImage: {
                        productImageId: imageVariant,
                        position,
                    },
                }),
            }
        );

        res = await res.json();
    };

    removeVariantsImages = async ({
        productVariant,
        productImageId,
        storeId,
    }) => {
        let res = await fetch(
            `/api/products/variants/images/${productVariant}`,
            {
                method: 'delete',
                headers: {
                    'Content-Type': 'application/json',
                    'x-unstock-store': storeId,
                },
                body: JSON.stringify({
                    productImageId: productImageId,
                }),
            }
        );
        res = await res.json();
        return res;
    };

    render() {
        const { lang, tags, vendors, storeId, id, session } = this.props;
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
            body: '',
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
            originalFiles: [],

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
                    row: 'price',
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
            showInventoryAddModal: false,
            showInventoryRemoveModal: false,
            inventory: '',
            loadingView: true,
            loadingDelete: false,
            loadingDisable: false,
            loadingEnable: false,
            slug: '',
            slugResult: { error: false, message: '' },
            isPublish: false,
            isArchive: false,
        };
    }

    componentDidMount() {
        const { id } = this.props;
        this.setupProduct(id.id)
            .then((result) => {
                const { product, tags, vendors } = result;
                this.setState({
                    loadingView: false,
                    name: product.title,
                    vendor: product.vendor,
                    tags: tags,
                    body: product.body,
                    tagList: product.tags,
                    vendors: vendors,
                    slug: product.slug,
                    isPublish: product.isPublish,
                    isArchive: product.isArchive,
                    files: product.images.map((file) => {
                        return {
                            name: file.id,
                            preview: file.image,
                            buffer: null,
                            id: file.id,
                        };
                    }),

                    variants: product.variants.map((value) => {
                        value.images = value.images.map((img) => {
                            return img.productImageId;
                        });
                        if (value.option_1 === null) delete value.option_1;
                        if (value.option_2 === null) delete value.option_2;
                        if (value.option_3 === null) delete value.option_3;
                        delete value.barcode;
                        return value;
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
            })
            .catch((e) => {
                window.location.href = '/products';
            });
    }

    setupProduct = async (id) => {
        const product = await this.getProduct(id);
        const tags = await this.getTags();
        const vendors = await this.getVendors();
        return { product, tags, vendors };
    };

    getProduct = async (id) => {
        const { storeId } = this.context;
        let query = await fetch(`/api/products/${id}`, {
            method: 'GET',
            headers: {
                'x-unstock-store': storeId,
            },
        });
        const data = await query.json();
        return data.product;
    };

    getTags = async () => {
        const { storeId } = this.props;
        const res = await fetch(`/api/tags`, {
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
                'x-unstock-store': storeId,
            },
        });
        return (await res.json()).tags;
    };

    getVendors = async () => {
        const { storeId } = this.props;
        const res = await fetch(`/api/vendors`, {
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
                'x-unstock-store': storeId,
            },
        });
        return (await res.json()).vendors;
    };

    onDeleteProduct = async (id) => {
        const { lang, storeId } = this.context;
        var confirmation = confirm(lang['DELETE_PRODUCTS_CONFIRM']);
        if (confirmation) {
            this.setState((prevState) => ({
                loadingDelete: !prevState.loadingDelete,
            }));
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
                        loadingDelete: !prevState.loadingDelete,
                    }));
                });
        }
    };

    validateSlug = async (slug) => {
        const { storeId } = this.props;
        const res = await fetch(`/api/slug`, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'x-unstock-store': storeId,
            },
            body: JSON.stringify({ slug }),
        });
        return await res.json();
    };

    handleUpdateProduct = async () => {
        const {
            id: { id },
        } = this.props;
        const { onSave, lang } = this.context;
        const product = this.state;
        const slugValidation = await this.validateSlug(product.slug);
        if (slugValidation.result && slugValidation.productId !== id) {
            window.alert(lang['INVALID_SLUG']);
            return;
        }

        product.tags = tagList;

        const originalProduct = await this.getProduct(id);

        const originalVariants = originalProduct.variants.map((value) => {
            value.images = value.images.map((img) => {
                return img.productImageId;
            });
            if (value.option_1 === null) delete value.option_1;
            if (value.option_2 === null) delete value.option_2;
            if (value.option_3 === null) delete value.option_3;
            delete value.barcode;
            return value;
        });

        const originalVariantsWithImages = originalProduct.variants;

        const originalFiles = originalProduct.images.map((file) => {
            return {
                name: file.id,
                preview: file.image,
                buffer: null,
                id: file.id,
            };
        });

        const { tagList, files, cols, variants } = this.state;

        let imagesToAdd = [];
        let imagesToDelete = [];
        let images = [];

        for (const image of files) {
            const find = originalFiles.find((value) => {
                return image.id === value.id;
            });
            if (!find) {
                imagesToAdd.push(image);
            }
        }

        for (const original of originalFiles) {
            const find = files.find((value) => {
                return original.id === value.id;
            });
            if (!find) {
                imagesToDelete.push(original);
            }
        }

        for (const original of originalFiles) {
            const findInDelete = imagesToDelete.find((value) => {
                return original.id === value.id;
            });

            const findInAdd = imagesToAdd.find((value) => {
                return original.id === value.id;
            });

            if (!findInDelete && !findInAdd) {
                images.push(original);
            }
        }

        product.imagesToAdd = imagesToAdd;
        product.imagesToDelete = imagesToDelete.map((value) => {
            return value.id;
        });
        product.images = images;

        let variantsToAdd = [];
        let variantsToRemove = [];
        let variantsToUpdate = [];

        for (const variant of variants) {
            const find = originalVariants.find((value) => {
                return variant.id === value.id;
            });
            if (!find) {
                variantsToAdd.push(variant);
            }
        }

        for (const original of originalVariants) {
            const find = variants.find((value) => {
                return original.id === value.id;
            });
            if (!find) {
                variantsToRemove.push(original);
            }
        }

        for (const original of originalVariants) {
            const find = variants.find((value) => {
                return original.id === value.id;
            });
            if (find) {
                if (JSON.stringify(find) !== JSON.stringify(original)) {
                    variantsToUpdate.push(find);
                }
            }
        }

        product.variantsToRemove = variantsToRemove.map((value) => {
            return value.id;
        });

        product.variantsToAdd = variantsToAdd;
        product.variantsToUpdate = variantsToUpdate;
        product.originalVariants = originalVariantsWithImages;

        if (cols[4]) {
            const colInfo = cols[4];
            if (colInfo.name.length === 0) {
                product.option_1 = 'Default';
            } else {
                product.option_1 = colInfo.name;
            }
        } else {
            product.option_1 = null;
        }

        if (cols[5]) {
            const colInfo = cols[5];
            product.option_2 = colInfo.name;
        } else {
            product.option_2 = null;
        }

        if (cols[6]) {
            const colInfo = cols[6];
            product.option_3 = colInfo.name;
        } else {
            product.option_3 = null;
        }

        console.log(product);
        onSave(product, id);
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

    selectInventoryModal = (variant, type) => {
        if (type === 'add') {
            this.setState({
                showInventoryAddModal: true,
                selectedVariant: variant,
            });
        } else if (type === 'remove') {
            this.setState({
                showInventoryRemoveModal: true,
                selectedVariant: variant,
            });
        }
    };

    updateInventoryValue = (value) => {
        if (value.length && parseInt(value) > 0) {
            if (!isNaN(value)) this.setState({ inventory: parseInt(value) });
        } else {
            this.setState({ inventory: '' });
        }
    };

    toggleAddInventoryModal = () => {
        this.setState({ showInventoryAddModal: false });
    };

    saveAddInventoryModal = async (variant, value) => {
        const { variants } = this.state;

        const update = await this.addVariantsInventory({
            variantId: variants[variant].id,
            qty: value,
        });
        if (update) {
            variants[variant].quantity = update.quantity;
            this.setState({
                showInventoryAddModal: false,
                variants,
                inventory: '',
            });
        }
    };

    addVariantsInventory = async ({ variantId, qty }) => {
        const { storeId } = this.props;
        let res = await fetch(
            `/api/products/variants/inventory/${variantId}/add/${qty}`,
            {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                    'x-unstock-store': storeId,
                },
            }
        );
        res = await res.json();
        console.log(res.result[0]);
        const response = res.result[0];
        if (response) return response;
        else return null;
    };

    saveRemoveInventoryModal = async (variant, value) => {
        const { variants } = this.state;
        const update = await this.RemoveVariantsInventory({
            variantId: variants[variant].id,
            qty: value,
        });
        if (update) {
            variants[variant].quantity = update.quantity;
            this.setState({
                showInventoryRemoveModal: false,
                variants,
                inventory: '',
            });
        }
    };

    RemoveVariantsInventory = async ({ variantId, qty }) => {
        const { storeId } = this.props;
        let res = await fetch(
            `/api/products/variants/inventory/${variantId}/remove/${qty}`,
            {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                    'x-unstock-store': storeId,
                },
            }
        );
        res = await res.json();
        console.log(res.result[0]);
        const response = res.result[0];
        if (response) return response;
        else return null;
    };

    toggleRemoveInventoryModal = () => {
        this.setState({ showInventoryRemoveModal: false });
    };

    addVariant = () => {
        let { variants, cols, files } = this.state;
        let initialValue = { images: [], sku: '', price: '1.00', quantity: 0 };
        cols.forEach((value, index) => {
            if (value.row !== 'images') initialValue[value.row] = '';
        });

        if (files.length > 0) {
            initialValue.images.push(files[0].id);
        }

        variants.push(initialValue);
        this.setState({ variants: variants });
        if (variants.length > 1 && !cols[4]) {
            this.addType();
        }
    };

    removeVariant = (value) => {
        let { variants, cols } = this.state;
        variants = variants.filter((element, index) => {
            return index !== value;
        });

        if (variants.length === 1) {
            cols = cols.filter((col) => {
                const { row } = col;
                if (row.includes('option_1')) {
                    return false;
                }

                if (row.includes('option_2')) {
                    return false;
                }

                if (row.includes('option_3')) {
                    return false;
                }

                return true;
            });

            variants = variants.map((variant) => {
                delete variant.option_1;
                delete variant.option_2;
                delete variant.option_3;
                return variant;
            });

            this.setState({ variants: variants, selectedVariant: 0, cols });

            return;
        }

        this.setState({ variants: variants, selectedVariant: 0 });
    };

    selectImages = (row) => {
        this.setState({ showVariantImagesModal: true, selectedVariant: row });
    };

    updateValue = (index, field, value) => {
        let { variants } = this.state;
        let element = variants[index];
        if (
            field === 'price' &&
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
        const validation = this.isVariantCombinationsValid(variants);
        return validation.invalidVariants.length > 0 ? true : false;
    };

    validateEqualSku = () => {
        let { variants } = this.state;
        let skus = variants.map((value) => {
            return value.sku;
        });

        const nonEmptySkus = skus.filter((sku) => !!sku);
        return Array.from(new Set(nonEmptySkus)).length !== nonEmptySkus.length;
    };

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

    isInvalidProduct = () => {
        const { name, variants, files, cols } = this.state;
        // 1. El nombre no puede estar vacio
        if (name.length === 0) return true;

        // 2. El producto tiene que tener variants
        if (!variants || variants.length === 0) return true;

        for (const variant of variants) {
            if (
                isNaN(variant.price) ||
                variant.price < 0.01 ||
                variant.price.length === 0
            )
                return true;
            if (isNaN(variant.quantity)) return true;
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
                isNaN(variant.price) ||
                variant.price < 0 ||
                variant.price.length === 0
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
            }
            //  else {
            //     this.setState({
            //         slugResult: { error: true, message: 'Slug Invalido' },
            //     });
            // }
        } else {
            this.setState({ slug: '' });
        }
    };

    render() {
        const { lang } = this.context;
        const { id, loading } = this.props;
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
            showInventoryAddModal,
            showInventoryRemoveModal,
            inventory,
            vendors,

            slug,
            slugResult,
            loadingView,
            loadingDelete,
            loadingDisable,
            loadingEnable,
            isPublish,
            isArchive,
        } = this.state;

        const isProductInvalid = this.isInvalidProduct();
        return (
            <div>
                {loadingView ? (
                    <Loading />
                ) : (
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
                        <AddToInventoryModal
                            variant={selectedVariant}
                            showModal={showInventoryAddModal}
                            toggleModal={this.toggleAddInventoryModal}
                            save={this.saveAddInventoryModal}
                            inventory={inventory}
                            updateInventory={this.updateInventoryValue}
                        />
                        <RemoveFromInventoryModal
                            variant={selectedVariant}
                            showModal={showInventoryRemoveModal}
                            toggleModal={this.toggleRemoveInventoryModal}
                            save={this.saveRemoveInventoryModal}
                            inventory={inventory}
                            updateInventory={this.updateInventoryValue}
                        />
                        <div className={styles['grid-container']}>
                            <div>
                                <div>
                                    <div className={styles['top-bar']}>
                                        <div
                                            className={
                                                styles['new-product-title']
                                            }
                                        >
                                            <Link href="/products">
                                                <div>
                                                    <button>
                                                        {' '}
                                                        &lt; Products
                                                    </button>
                                                </div>
                                            </Link>
                                            <h3>
                                                {lang['PRODUCTS_EDIT_TITLE']}
                                            </h3>
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
                                                removeVariant={
                                                    this.removeVariant
                                                }
                                                addType={this.addType}
                                                selectImages={this.selectImages}
                                                updateValue={this.updateValue}
                                                updateType={this.updateType}
                                                removeType={this.removeType}
                                                getImageByID={this.getImageByID}
                                                canRemoveType={
                                                    this.canRemoveType
                                                }
                                                selectInventoryModal={
                                                    this.selectInventoryModal
                                                }
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
                                        onClick={() =>
                                            this.handleUpdateProduct()
                                        }
                                        loading={loading}
                                        disabled={isProductInvalid}
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
                                        vendors={vendors}
                                    />
                                </div>
                                <div>
                                    <Card width="100%">
                                        <Card.Content>
                                            <Text b>
                                                {' '}
                                                {lang['PRODUCT_ACTIONS']}
                                            </Text>
                                        </Card.Content>
                                        <Divider y={0} />
                                        <Card.Content
                                            className={
                                                styles['product-actions']
                                            }
                                        >
                                            <Spacer y={0.5} />
                                            <div>
                                                {' '}
                                                <Button
                                                    size="large"
                                                    type="error"
                                                    ghost
                                                    onClick={() =>
                                                        this.onDeleteProduct(id)
                                                    }
                                                    loading={loadingDelete}
                                                    disabled={loading}
                                                >
                                                    {
                                                        lang[
                                                            'PRODUCT_ACTIONS_DELETE'
                                                        ]
                                                    }
                                                </Button>
                                                <Spacer y={0.5} />
                                            </div>
                                            {!isPublish ? (
                                                <div>
                                                    {' '}
                                                    <Button
                                                        size="large"
                                                        type="warning"
                                                        onClick={() =>
                                                            this.onDeleteProduct(
                                                                id
                                                            )
                                                        }
                                                        loading={loadingDelete}
                                                        disabled={loading}
                                                    >
                                                        {
                                                            lang[
                                                                'DISABLE_PRODUCT'
                                                            ]
                                                        }
                                                    </Button>
                                                    <Spacer y={0.5} />
                                                </div>
                                            ) : (
                                                <div>
                                                    {' '}
                                                    <Button
                                                        size="large"
                                                        type="secondary"
                                                        onClick={() =>
                                                            this.onDeleteProduct(
                                                                id
                                                            )
                                                        }
                                                        loading={loadingDelete}
                                                        disabled={loading}
                                                    >
                                                        {lang['ENABLE_PRODUCT']}
                                                    </Button>
                                                    <Spacer y={0.5} />
                                                </div>
                                            )}

                                            {!isArchive ? (
                                                <div>
                                                    {' '}
                                                    <Button
                                                        size="large"
                                                        type="abort"
                                                        onClick={() =>
                                                            this.onDeleteProduct(
                                                                id
                                                            )
                                                        }
                                                        loading={loadingDelete}
                                                        disabled={loading}
                                                    >
                                                        {
                                                            lang[
                                                                'ARCHIVE_PRODUCT'
                                                            ]
                                                        }
                                                    </Button>
                                                    <Spacer y={0.5} />
                                                </div>
                                            ) : (
                                                <div>
                                                    {' '}
                                                    <Button
                                                        size="large"
                                                        type="secondary"
                                                        onClick={() =>
                                                            this.onDeleteProduct(
                                                                id
                                                            )
                                                        }
                                                        loading={loadingDelete}
                                                        disabled={loading}
                                                    >
                                                        {
                                                            lang[
                                                                'UNARCHIVE_PRODUCT'
                                                            ]
                                                        }
                                                    </Button>
                                                    <Spacer y={0.5} />
                                                </div>
                                            )}
                                        </Card.Content>
                                    </Card>
                                </div>
                                <Spacer y={1.5} />

                                {this.loadErrors().length > 0 && !loading && (
                                    <div>
                                        <Card width="100%">
                                            <Card.Content>
                                                <Text b>
                                                    Errores creando producto
                                                </Text>
                                            </Card.Content>
                                            <Divider y={0} />
                                            <Card.Content
                                                className={
                                                    styles['product-actions']
                                                }
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
                )}
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

function Description({ description, onChange }) {
    const { lang } = useContext(DataContext);
    return (
        <div className={styles['new-product-info-description']}>
            <h3>{lang['PRODUCTS_NEW_DESCRIPTION']}</h3>
            <div>
                <textarea
                    name="description"
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
    selectInventoryModal,
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
                                                {lang[value.name.toUpperCase()]}
                                            </th>
                                        );
                                    }
                                }
                            })}
                            {cols.length < 7 && variants.length > 1 && (
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
                                    selectInventoryModal={selectInventoryModal}
                                    variants={variants}
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
    selectInventoryModal,
    variants,
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
                if (value !== 'id' && value !== 'images') {
                    if (value === 'quantity') {
                        if (!variants[row].id) {
                            return (
                                <td
                                    className={styles['variants-table-center']}
                                    key={'row-' + value + '-' + index}
                                >
                                    <Input
                                        value={values[value]}
                                        onChange={(e) => {
                                            if (!isNaN(e.target.value)) {
                                                updateValue(
                                                    row,
                                                    value,
                                                    e.target.value
                                                );
                                            }
                                        }}
                                    />
                                </td>
                            );
                        } else {
                            return (
                                <td
                                    className={
                                        styles['variants-table-center-button']
                                    }
                                    key={'row-' + value + '-' + index}
                                >
                                    <Input
                                        value={values[value]}
                                        disabled={true}
                                    />
                                    <Button
                                        auto
                                        size="small"
                                        type="error"
                                        onClick={(e) =>
                                            selectInventoryModal(row, 'remove')
                                        }
                                    >
                                        -
                                    </Button>
                                    <Button
                                        auto
                                        size="small"
                                        type="success"
                                        onClick={(e) =>
                                            selectInventoryModal(row, 'add')
                                        }
                                    >
                                        +
                                    </Button>
                                </td>
                            );
                        }
                    } else {
                        let onChange;
                        if (value == 'price') {
                            onChange = (e) => {
                                if (!isNaN(e.target.value)) {
                                    updateValue(row, value, e.target.value);
                                }
                            };
                        } else {
                            onChange = (e) => {
                                updateValue(row, value, e.target.value);
                            };
                        }

                        return (
                            <td
                                className={styles['variants-table-center']}
                                key={'row-' + value + '-' + index}
                            >
                                <Input
                                    value={values[value]}
                                    onChange={onChange}
                                />
                            </td>
                        );
                    }
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
    let imageRender = [];
    images.forEach((element, index) => {
        if (variants.length > 0) {
            if (
                variants[selectedVariant].images &&
                variants[selectedVariant].images.find((value) => {
                    return value === element.id;
                })
            ) {
                let imgNumber = variants[selectedVariant].images.findIndex(
                    (value, index) => {
                        return value === element.id;
                    }
                );

                imageRender.push(
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
                imageRender.push(
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
                        {imageRender}
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
    vendors,
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
    const { lang } = useContext(DataContext);
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

function AddToInventoryModal({
    variant,
    showModal,
    toggleModal,
    save,
    inventory,
    updateInventory,
}) {
    return (
        <Modal open={showModal} onClose={toggleModal}>
            <Modal.Title>Agregar al Inventario</Modal.Title>
            <Modal.Content>
                <Input
                    placeholder="Cantidad"
                    width="100%"
                    value={inventory}
                    onChange={(e) => updateInventory(e.target.value)}
                />
            </Modal.Content>
            <Modal.Action
                passive
                onClick={(e) => save(variant, inventory)}
                disabled={inventory.length === 0}
            >
                Guardar
            </Modal.Action>
        </Modal>
    );
}

function RemoveFromInventoryModal({
    variant,
    showModal,
    toggleModal,
    save,
    inventory,
    updateInventory,
}) {
    return (
        <Modal open={showModal} onClose={toggleModal}>
            <Modal.Title>Quitar del inventario</Modal.Title>
            <Modal.Content>
                <Input
                    placeholder="Cantidad"
                    width="100%"
                    value={inventory}
                    onChange={(e) => updateInventory(e.target.value)}
                />
            </Modal.Content>
            <Modal.Action
                passive
                onClick={(e) => save(variant, inventory)}
                disabled={inventory.length === 0}
            >
                Guardar
            </Modal.Action>
        </Modal>
    );
}

function ProductSlug({ slug, onChange, result }) {
    const { lang } = useContext(DataContext);
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
