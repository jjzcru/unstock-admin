import React, { useContext } from 'react';
import dynamic from 'next/dynamic';

import styles from './newDraft.module.css';

import { Sidebar } from '@components/Sidebar';
import { Navbar } from '@components/Navbar';

import moment from 'moment';

import {
    Dot,
    Badge,
    Button,
    Avatar,
    Row,
    Loading,
    Spacer,
    Modal,
    AutoComplete,
    Grid,
    Text,
    Select,
    Table,
    Card,
    Radio,
    Input,
} from '@geist-ui/react';
import { UserX, X, XCircle } from '@geist-ui/react-icons';

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

    try {
        id = ctx.params;
    } catch (e) {
        console.error(e);
    }
    return {
        props: { lang, session, storeId }, // will be passed to the page component as props
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

    render() {
        const { lang, id, session, storeId } = this.props;
        const { langName } = this.state;
        const selectedLang = lang[langName];

        return (
            <DataContext.Provider
                value={{
                    lang: selectedLang,
                    storeId,
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
                            <Content lang={selectedLang} id={id} />
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
        this.state = {
            draft: {},
            map: null,
            loadingProducts: false,
            showProductsModal: false,
            products: [],
            variants: [],
            selectedProduct: null,
            selectedVariant: null,
            loadingVariants: false,
            items: [],
            costumer: null,
            loadingCostumers: false,
            costumersModal: false,
            fullfilmentType: null,
            selectedAddress: null,
            selectedPickup: null,
            showAddress: false,
            address: { address1: '', address2: '', city: '', province: '' },
            showNewCostumer: false,
            newCostumer: { firstName: '', lastName: '', email: '', phone: '' },
            pickupLocations: [],
        };
    }

    componentDidMount() {
        this.getStoreLocations();
    }

    getStoreLocations = async () => {
        const { storeId } = this.context;
        let query = await fetch('/api/pickups', {
            method: 'GET',
            headers: {
                'x-unstock-store': storeId,
            },
        });
        const data = await query.json();
        this.setState({ pickupLocations: data });
    };

    goBack() {
        window.location.href = '/drafts';
    }

    onMapLoad = (map) => {
        this.setState({ map });
    };

    showProductsModal = () => {
        this.setState({ loadingProducts: true });
        this.setupProducts()
            .then((products) => {
                console.log(products);
                this.setState({
                    loadingProducts: false,
                    products,
                    showProductsModal: true,
                });
            })
            .catch(console.error);
    };

    setupProducts = async () => {
        let products = await this.getProducts();
        products.sort(
            (a, b) => parseFloat(a.position) - parseFloat(b.position)
        );
        return products;
    };

    getProducts = async () => {
        const { storeId } = this.context;
        let query = await fetch('/api/products', {
            method: 'GET',
            headers: {
                'x-unstock-store': storeId,
            },
        });
        const data = await query.json();
        return data.products;
    };

    selectProduct = async (product) => {
        console.log(product);
        this.setState({
            selectedProduct: product,
            loadingVariants: true,
        });
        const { storeId } = this.context;
        let query = await fetch(`/api/products/${product.id}`, {
            method: 'GET',
            headers: {
                'x-unstock-store': storeId,
            },
        });
        const data = await query.json();
        this.setState({
            variants: data.product.variants,
            loadingVariants: false,
        });
    };

    closeProductModal = () => {
        this.setState({
            selectedProduct: null,
            selectedVariant: null,
            loadingVariants: false,
            showProductsModal: false,
        });
    };

    selectVariant = async (variant) => {
        this.setState({
            selectedVariant: variant,
        });
    };
    clearProductSelection = () => {
        this.setState({
            selectedProduct: null,
            selectedVariant: null,
            variants: [],
        });
    };

    saveProductSelection = (product, variant) => {
        const { items } = this.state;
        product.variant = variant;
        product.quantity = 1;
        items.push(product);
        this.setState({ items, showProductsModal: false });
    };

    showCostumersModal = () => {
        this.setState({ loadingCostumers: true, costumersModal: true });
        this.getCostumers()
            .then((costumers) => {
                console.log(costumers);
                this.setState({
                    loadingCostumers: false,
                    costumers,
                });
            })
            .catch(console.error);
    };

    getCostumers = async () => {
        const { storeId } = this.context;
        let query = await fetch('/api/costumers', {
            method: 'GET',
            headers: {
                'x-unstock-store': storeId,
            },
        });
        const data = await query.json();
        return data.costumers;
    };

    closeCostumersModal = () => {
        this.setState({ loadingCostumers: false, costumersModal: false });
    };

    selectCostumer = (costumer) => {
        this.setState({ costumersModal: false, costumer: costumer });
    };

    clearCostumersModal = () => {
        this.setState({
            costumer: null,
        });
        this.showCostumersModal();
    };

    addNewCostumer = (costumer) => {};

    selectFullfilment = (type) => {
        this.setState({ fullfilmentType: type });
    };

    setAddress = (address1, address2, city, province) => {
        this.setState({ address: { address1, address2, city, province } });
    };

    saveAdress = () => {
        this.setState({ showAddress: true });
    };

    clearFultilment = () => {
        this.setState({
            showAddress: false,
            fullfilmentType: null,
            address: { address1: '', address2: '', city: '', province: '' },
        });
    };

    saveDraft = async () => {
        // console.log(this.state);
        const {
            items,
            address,
            fullfilmentType,
            costumer,
            selectedPickup,
        } = this.state;
        console.log(items);
        const subtotal = items.reduce(
            (accumulator, current) => accumulator + current.variant.price,
            0
        );
        const tax = 0.07;
        const total = subtotal * tax + subtotal;

        const draftInfo = {
            total: total,
            currency: 'PAB',
            subtotal: subtotal,
            tax: 0.07,
            status: 'open',
            shippingType: null,
        };

        draftInfo.address = {
            address_1: address.address1,
            address_2: address.address2,
            city: address.city,
            province: address.province,
        };

        draftInfo.items = items.map((item) => {
            return {
                variantId: item.variant.id,
                price: item.variant.price,
                sku: item.variant.sku,
                quantity: item.quantity,
            };
        });

        if (fullfilmentType === 'delivery') {
            draftInfo.shippingType = 'delivery';
            draftInfo.shippingLocation = address;
        } else if (fullfilmentType === 'pickup') {
            draftInfo.shippingType = 'pickup';
            draftInfo.pickupLocation = selectedPickup;
        }

        if (costumer) {
            draftInfo.costumer = {
                firstName: costumer.firstName,
                lastName: costumer.lastName,
                email: costumer.email,
                phone: costumer.phone,
            };
        }

        console.log(draftInfo);
        const draft = await this.createDraft(draftInfo);
        if (draft) window.location.href = `${draft.id}`;
        console.log(draft);
    };

    createDraft = async (data) => {
        const { storeId } = this.context;
        const res = await fetch('/api/drafts', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'x-unstock-store': storeId,
            },
            body: JSON.stringify(data),
        });
        return (await res.json()).draft;
    };

    showCreateNewCostumer = () => {
        this.setState({ showNewCostumer: true });
    };

    setCostumer = (firstName, lastName, email, phone) => {
        this.setState({ newCostumer: { firstName, lastName, email, phone } });
    };

    createCustomer = () => {
        const { newCostumer } = this.state;
        console.log(newCostumer);
        // CREAMOS EL CLIENTE
        // CON LA RESPUESTA LO ASIGNAMOS AL USUARIO
        // CERRAMOS EL MODAL
    };

    selectPickupLocation = (id) => {
        console.log(id);
        const { pickupLocations } = this.state;
        const selected = pickupLocations.find((location) => {
            return location.id === id;
        });
        this.setState({ selectedPickup: selected });
    };

    render() {
        const { lang } = this.context;

        const {
            loadingView,
            paidLoading,
            loadingProducts,
            showProductsModal,
            products,
            variants,
            selectedProduct,
            selectedVariant,
            loadingVariants,
            items,
            costumer,
            costumersModal,
            loadingCostumers,
            costumers,
            fullfilmentType,
            selectedAddress,
            selectedPickup,
            showAddress,
            address,
            showNewCostumer,
            newCostumer,
            pickupLocations,
        } = this.state;

        console.log(pickupLocations);
        return (
            <div className={styles['main-content']}>
                <ProductsModal
                    showModal={showProductsModal}
                    closeModal={this.closeProductModal}
                    products={products}
                    variants={variants}
                    selectedProduct={selectedProduct}
                    selectedVariant={selectedVariant}
                    selectProduct={this.selectProduct}
                    loadingVariants={loadingVariants}
                    selectVariant={this.selectVariant}
                    clearProductSelection={this.clearProductSelection}
                    saveProductSelection={this.saveProductSelection}
                />
                <ClientsModal
                    showModal={costumersModal}
                    closeModal={this.closeCostumersModal}
                    costumers={costumers}
                    loadingCostumers={loadingCostumers}
                    selectCostumer={this.selectCostumer}
                    showNewCostumer={showNewCostumer}
                    showCreateNewCostumer={this.showCreateNewCostumer}
                    setCostumer={this.setCostumer}
                    createCustomer={this.createCustomer}
                    newCostumer={newCostumer}
                />
                {loadingView === true ? (
                    <Row style={{ padding: '200px 0' }}>
                        <Loading />
                    </Row>
                ) : (
                    <div>
                        <div className={styles['top-bar-navi']}>
                            <div className={styles['top-bar']}>
                                <div>
                                    <button onClick={() => this.goBack()}>
                                        {' '}
                                        &lt; {lang['DRAFT_ORDERS']}
                                    </button>
                                    <p>
                                        <span
                                            className={styles['top-bar-order']}
                                        >
                                            Crear nueva orden
                                        </span>
                                    </p>
                                </div>
                                <div>
                                    <Button
                                        type="secondary"
                                        size="small"
                                        onClick={() => this.saveDraft()}
                                    >
                                        Guardar
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className={styles['grid-container']}>
                            <div>
                                <div className={styles['products-box']}>
                                    {/* <p>
                                        {order.fulfillmentStatus === null
                                            ? lang['PENDING']
                                            : order.fulfillmentStatus}{' '}
                                        ({order.items.length})
                                    </p> */}
                                    <p>Detalles de la orden</p>
                                    <div
                                        className={styles['products-box-items']}
                                    >
                                        {items.map((value, key) => {
                                            return (
                                                <RenderOrderItem
                                                    value={value}
                                                    index={key}
                                                    items={items}
                                                    key={key}
                                                />
                                            );
                                        })}
                                        {items.length === 0 && (
                                            <div>
                                                {' '}
                                                <small>
                                                    Ningun producto añadido.
                                                </small>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <Button
                                            shadow
                                            type="secondary"
                                            loading={loadingProducts}
                                            auto
                                            onClick={() =>
                                                this.showProductsModal()
                                            }
                                        >
                                            Agregar productos
                                        </Button>
                                    </div>
                                </div>
                                <Totals
                                    items={items}
                                    paidLoading={paidLoading}
                                    MarkAsPaid={this.MarkAsPaid}
                                />
                            </div>
                            <div>
                                <div className={styles['notes-box']}>
                                    <p>{lang['CUSTOMER']}</p>
                                    <div>
                                        {costumer === null ? (
                                            <Button
                                                shadow
                                                type="secondary"
                                                loading={paidLoading}
                                                onClick={() =>
                                                    this.showCostumersModal()
                                                }
                                            >
                                                Seleccionar
                                            </Button>
                                        ) : (
                                            <div>
                                                <p>
                                                    {costumer.firstName}{' '}
                                                    {costumer.lastName}
                                                </p>
                                                <p>{costumer.email}</p>
                                                <p>{costumer.phone}</p>
                                                {/* <Spacer y={1} /> */}
                                                <Button
                                                    icon={<UserX />}
                                                    type="error"
                                                    ghost
                                                    onClick={() =>
                                                        this.clearCostumersModal()
                                                    }
                                                >
                                                    Cambiar
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className={styles['info-box']}>
                                    <p>Opciones de entrega</p>
                                    {!fullfilmentType && (
                                        <div>
                                            {' '}
                                            <Spacer y={3.5} />
                                            <span
                                                className={
                                                    styles['info-box-icon']
                                                }
                                            >
                                                <Button
                                                    type="secondary"
                                                    onClick={() =>
                                                        this.selectFullfilment(
                                                            'delivery'
                                                        )
                                                    }
                                                    ghost
                                                >
                                                    Delivery
                                                </Button>{' '}
                                                <Spacer y={0.5} />
                                                <Button
                                                    type="success"
                                                    onClick={() =>
                                                        this.selectFullfilment(
                                                            'pickup'
                                                        )
                                                    }
                                                    ghost
                                                >
                                                    Retiro en tienda
                                                </Button>{' '}
                                            </span>
                                            <Spacer y={3.5} />
                                        </div>
                                    )}

                                    {fullfilmentType === 'delivery' &&
                                    !showAddress ? (
                                        <div>
                                            {' '}
                                            <Spacer y={1} />
                                            <span
                                                className={
                                                    styles['info-box-icon']
                                                }
                                            >
                                                <Input
                                                    value={address.address1}
                                                    onChange={(e) =>
                                                        this.setAddress(
                                                            e.target.value,
                                                            address.address2,
                                                            address.city,
                                                            address.province
                                                        )
                                                    }
                                                >
                                                    Direccion 1
                                                </Input>
                                                <Spacer y={0.5} />
                                                <Input
                                                    value={address.address2}
                                                    onChange={(e) =>
                                                        this.setAddress(
                                                            address.address1,
                                                            e.target.value,
                                                            address.city,
                                                            address.province
                                                        )
                                                    }
                                                >
                                                    Direccion 2
                                                </Input>
                                                <Spacer y={0.5} />
                                                <Input
                                                    value={address.city}
                                                    onChange={(e) =>
                                                        this.setAddress(
                                                            address.address1,
                                                            address.address2,
                                                            e.target.value,
                                                            address.province
                                                        )
                                                    }
                                                >
                                                    Ciudad
                                                </Input>
                                                <Spacer y={0.5} />
                                                <Input
                                                    value={address.province}
                                                    onChange={(e) =>
                                                        this.setAddress(
                                                            address.address1,
                                                            address.address2,
                                                            address.city,
                                                            e.target.value
                                                        )
                                                    }
                                                >
                                                    Provincia
                                                </Input>
                                                <Spacer y={0.5} />
                                                <Button
                                                    size="mini"
                                                    type="success"
                                                    onClick={() =>
                                                        this.saveAdress()
                                                    }
                                                >
                                                    Guardar
                                                </Button>
                                            </span>
                                            <Spacer y={1.5} />
                                        </div>
                                    ) : (
                                        <div></div>
                                    )}

                                    {fullfilmentType === 'delivery' &&
                                        showAddress && (
                                            <span
                                                className={
                                                    styles['info-box-icon']
                                                }
                                            >
                                                <p>
                                                    <small>Dirección</small>
                                                </p>
                                                <Spacer y={1} />
                                                <p>{address.address1}</p>
                                                <p> {address.address2}</p>
                                                <p> {address.city}</p>
                                                <p> {address.province}</p>
                                                <Spacer y={1} />
                                                {/* <Button
                                                    icon={<XCircle />}
                                                    size="mini"
                                                    type="error"
                                                    ghost
                                                    onClick={() =>
                                                        this.clearCostumersModal()
                                                    }
                                                >
                                                    Cambiar
                                                </Button> */}

                                                <Button
                                                    icon={<XCircle />}
                                                    size="mini"
                                                    type="error"
                                                    onClick={() =>
                                                        this.clearFultilment()
                                                    }
                                                >
                                                    Cambiar
                                                </Button>

                                                <Spacer y={1} />
                                            </span>
                                        )}

                                    {fullfilmentType === 'pickup' ? (
                                        <div>
                                            {' '}
                                            <Spacer y={2.5} />
                                            <span
                                                className={
                                                    styles['info-box-icon']
                                                }
                                            >
                                                <Select
                                                    placeholder="Seleccione"
                                                    onChange={(e) =>
                                                        this.selectPickupLocation(
                                                            e
                                                        )
                                                    }
                                                >
                                                    {pickupLocations.map(
                                                        (location, key) => {
                                                            return (
                                                                <Select.Option
                                                                    value={
                                                                        location.id
                                                                    }
                                                                    key={
                                                                        'location-' +
                                                                        key
                                                                    }
                                                                >
                                                                    {
                                                                        location.name
                                                                    }
                                                                </Select.Option>
                                                            );
                                                        }
                                                    )}
                                                </Select>
                                                <Spacer y={0.5} />
                                                <Button
                                                    icon={<XCircle />}
                                                    size="mini"
                                                    type="error"
                                                    onClick={() =>
                                                        this.clearFultilment()
                                                    }
                                                >
                                                    Cambiar
                                                </Button>
                                            </span>
                                            <Spacer y={3.5} />
                                        </div>
                                    ) : (
                                        <div></div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}
function RenderOrderItem({ value, index, items }) {
    return (
        <div
            key={'item-' + index}
            className={
                index < items.length - 1
                    ? styles['info-box-separator']
                    : undefined
            }
        >
            <div>
                <Avatar text="P" isSquare />
            </div>
            <div className={styles['products-variant']}>
                <p>{value.title}</p>
                <p>
                    {[
                        value.variant.option_1,
                        value.variant.option_2,
                        value.variant.option_3,
                    ]
                        .filter((o) => o)
                        .join(' - ')}
                </p>
            </div>
            <div>
                ${value.variant.price} x {value.quantity}
            </div>
            <div>${(value.variant.price * value.quantity).toFixed(2)}</div>
        </div>
    );
}

function Totals({ items, paidLoading, MarkAsPaid }) {
    const { lang } = useContext(DataContext);
    console.log(items);
    const subtotal = items.reduce(
        (accumulator, current) => accumulator + current.variant.price,
        0
    );
    const tax = 0.07;
    const total = subtotal * tax + subtotal;

    return (
        <div className={styles['total-box']}>
            <p>{lang['PAYMENT_STATUS']}</p>
            <div className={styles['total-box-items']}>
                <div>
                    <div className={styles['total-box-items-first']}>
                        <p>Subtotal</p>
                    </div>
                    <div className={styles['total-box-items-second']}>
                        {' '}
                        <p>
                            {items.length > 1 ? (
                                <span>
                                    {items.length} {lang['ITEMS']}
                                </span>
                            ) : (
                                <span>
                                    {items.length} {lang['ITEM']}
                                </span>
                            )}
                        </p>
                    </div>
                    <div className={styles['total-box-items-third']}>
                        {' '}
                        <p>${subtotal.toFixed(2)}</p>
                    </div>
                </div>

                {/* {order.shippingOption && (
                    <div>
                        <div className={styles['total-box-items-first']}>
                            <p>{lang['SHIPMENT']}</p>
                        </div>
                        <div className={styles['total-box-items-second']}>
                            {' '}
                            <p></p>
                        </div>
                        <div className={styles['total-box-items-third']}>
                            {' '}
                            <p>${order.shippingOption.price}</p>
                        </div>
                    </div>
                )} */}
                <div>
                    <div className={styles['total-box-items-first']}>
                        <p>{lang['TAX']}</p>
                    </div>
                    <div className={styles['total-box-items-second']}>
                        {' '}
                        <p>({tax}%)</p>
                    </div>
                    <div className={styles['total-box-items-third']}>
                        {' '}
                        <p>${(subtotal * tax).toFixed(2)}</p>
                    </div>
                </div>
                <div>
                    <div className={styles['total-box-items-first']}>
                        <p>Total</p>
                    </div>
                    <div className={styles['total-box-items-second']}> </div>
                    <div className={styles['total-box-items-third']}>
                        {' '}
                        <p>${total.toFixed(2)}</p>
                    </div>
                </div>
            </div>
            <div>
                {/* {draft.status !== 'cancelled' && draft.status !== 'closed' && (
                    <Button
                        shadow
                        type="secondary"
                        loading={paidLoading}
                        onClick={() => MarkAsPaid()}
                    >
                        {lang['MARK_AS_PAID']}
                    </Button>
                )} */}
            </div>
        </div>
    );
}

function ProductsModal({
    showModal,
    closeModal,
    products,
    variants,
    selectedProduct,
    selectedVariant,
    selectProduct,
    loadingVariants,
    selectVariant,
    clearProductSelection,
    saveProductSelection,
}) {
    const options = products.map((product, key) => {
        return (
            <AutoComplete.Option value={product}>
                <Grid.Container style={{ padding: '10pt 0' }}>
                    <Grid xs={24}>
                        <Text span b size="1.2rem">
                            {product.title}
                        </Text>
                    </Grid>
                    <Grid.Container xs={24}>
                        <Grid xs>
                            <Text span>
                                {product.inventory.variants} Variantes
                            </Text>
                        </Grid>
                    </Grid.Container>
                </Grid.Container>
            </AutoComplete.Option>
        );
    });
    console.log(variants);
    return (
        <Modal open={showModal} onClose={closeModal}>
            <Modal.Title>Productos </Modal.Title>
            <Modal.Subtitle>Seleccione un producto a agregar</Modal.Subtitle>
            <Modal.Content>
                {!selectedProduct && (
                    <AutoComplete
                        placeholder="Ingrese el producto"
                        width="100%"
                        options={options}
                        onSearch={null}
                        onSelect={(e) => selectProduct(e)}
                    />
                )}
                {selectedProduct && (
                    <div>
                        {' '}
                        <Card>
                            <p>
                                {' '}
                                <Button
                                    iconRight={<X />}
                                    auto
                                    size="small"
                                    type="error"
                                    onClick={() => clearProductSelection()}
                                />{' '}
                                {selectedProduct.title}
                            </p>
                        </Card>
                        {variants.length > 0 && (
                            <div>
                                <Spacer y={0.5} />
                                <Text span size="12px" type="secondary">
                                    Variantes
                                </Text>
                                <Radio.Group
                                    value={null}
                                    onChange={(e) => selectVariant(e)}
                                >
                                    {variants.map((variant, key) => {
                                        return (
                                            <Radio
                                                value={variant}
                                                key={'variant-' + key}
                                            >
                                                {' '}
                                                SKU: {variant.sku}
                                                <Radio.Description>
                                                    {variant.option_1 && (
                                                        <p>
                                                            {variant.option_1}
                                                        </p>
                                                    )}
                                                    {variant.option_2 && (
                                                        <p>
                                                            {variant.option_2}{' '}
                                                        </p>
                                                    )}
                                                    {variant.option_3 && (
                                                        <p>
                                                            {variant.option_3}
                                                        </p>
                                                    )}
                                                </Radio.Description>
                                            </Radio>
                                        );
                                    })}
                                    {variants.length === 0 && (
                                        <p>Ninguna variante disponible</p>
                                    )}
                                </Radio.Group>
                            </div>
                        )}
                    </div>
                )}
            </Modal.Content>
            <Modal.Action passive onClick={() => closeModal()}>
                Cancelar
            </Modal.Action>
            <Modal.Action
                loading={loadingVariants}
                disabled={!selectedProduct || !selectedVariant}
                onClick={() =>
                    saveProductSelection(selectedProduct, selectedVariant)
                }
                saveProductSelection
            >
                Agregar
            </Modal.Action>
        </Modal>
    );
}

function ClientsModal({
    showModal,
    closeModal,
    costumers,
    loadingCostumers,
    selectCostumer,
    showNewCostumer,
    showCreateNewCostumer,
    setCostumer,
    createCustomer,
    newCostumer,
}) {
    const operation = (costumer) => {
        return (
            <Button
                type="success"
                auto
                size="mini"
                onClick={(e) => selectCostumer(costumer)}
            >
                Seleccionar
            </Button>
        );
    };
    if (costumers) {
        const clients = costumers.map((costumer, key) => {
            costumer.name = `${costumer.firstName} ${costumer.lastName}`;
            costumer.operation = operation(costumer);
            return costumer;
        });
    } else {
        const clients = [];
    }

    return (
        <Modal open={showModal} onClose={closeModal} width="40rem">
            <Modal.Title>Seleccionar cliente </Modal.Title>
            <Modal.Content>
                {loadingCostumers ? (
                    <Row style={{ padding: '10px 0', width: '50px' }}>
                        <Loading size="large" />
                    </Row>
                ) : (
                    <div>
                        {/* <Input placeholder="Buscar cliente..." width="100%" />{' '} */}
                        {!showNewCostumer && (
                            <div>
                                <Spacer y={0.2} />
                                <Table data={costumers}>
                                    <Table.Column prop="name" label="Nombre" />
                                    <Table.Column
                                        prop="phone"
                                        label="Telefono"
                                    />
                                    <Table.Column prop="email" label="Email" />
                                    <Table.Column prop="operation" label="" />
                                </Table>
                                <Spacer y={0.5} />
                                <Button
                                    shadow
                                    type="secondary"
                                    auto
                                    onClick={() => showCreateNewCostumer()}
                                >
                                    Nuevo
                                </Button>{' '}
                            </div>
                        )}
                        {showNewCostumer && (
                            <div>
                                <Input
                                    value={newCostumer.firstName}
                                    onChange={(e) =>
                                        setCostumer(
                                            e.target.value,
                                            newCostumer.lastName,
                                            newCostumer.email,
                                            newCostumer.phone
                                        )
                                    }
                                >
                                    Nombre
                                </Input>
                                <Spacer />
                                <Input
                                    value={newCostumer.lastName}
                                    onChange={(e) =>
                                        setCostumer(
                                            newCostumer.firstName,
                                            e.target.value,
                                            newCostumer.email,
                                            newCostumer.phone
                                        )
                                    }
                                >
                                    Apellido
                                </Input>
                                <Spacer />
                                <Input
                                    value={newCostumer.email}
                                    onChange={(e) =>
                                        setCostumer(
                                            newCostumer.firstName,
                                            newCostumer.lastName,
                                            e.target.value,
                                            newCostumer.phone
                                        )
                                    }
                                >
                                    Email
                                </Input>
                                <Spacer />
                                <Input
                                    value={newCostumer.phone}
                                    onChange={(e) =>
                                        setCostumer(
                                            newCostumer.firstName,
                                            newCostumer.lastName,
                                            newCostumer.email,
                                            e.target.value
                                        )
                                    }
                                >
                                    Telefono
                                </Input>
                                <Spacer />
                                <Button
                                    auto
                                    type="secondary"
                                    onClick={() => createCustomer()}
                                >
                                    Agregar
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </Modal.Content>
            <Modal.Action passive onClick={() => closeModal()}>
                Cancelar
            </Modal.Action>
        </Modal>
    );
}
