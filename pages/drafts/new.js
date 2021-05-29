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
    Checkbox,
    AutoComplete,
    Grid,
    Text,
    Select,
    Table,
    Input,
} from '@geist-ui/react';
import { MapPin } from '@geist-ui/react-icons';

import lang from '@lang';
import { getSession } from 'next-auth/client';
import { getSessionData } from '@utils/session';

const Map = dynamic(
    () => {
        return import('@components/orders/Map.js');
    },
    { ssr: false }
);

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
            order: {},
            loading: true,
            cancelLoading: false,
            closeLoading: false,
            loadingView: true,
            paidLoading: false,
            map: null,
        };
    }

    componentDidMount() {
        this.setState({ loadingView: false });
    }

    finanncialBadge(status) {
        const { lang } = this.context;
        switch (status) {
            case 'pending':
                return (
                    <Badge
                        type="warning"
                        style={{
                            color: 'black',
                        }}
                    >
                        <Dot type="error"></Dot>
                        {lang['PAYMENT_PENDING']}
                    </Badge>
                );
            case 'paid':
                return (
                    <Badge type="success">
                        <Dot></Dot>
                        {lang['PAYMENT_PAID']}
                    </Badge>
                );
            case 'refunded':
                return (
                    <Badge type="secondary">
                        <Dot></Dot>
                        {lang['PAYMENT_REFUNDED']}
                    </Badge>
                );
            case 'partially_refunded':
                return (
                    <Badge type="secondary">
                        <Dot></Dot>
                        {lang['PAYMENT_PARTIALLY_REFUNDED']}
                    </Badge>
                );
            case 'partially_paid':
                return (
                    <Badge type="secondary">
                        <Dot></Dot>
                        {lang['PAYMENT_PARTIALLY_PAID']}
                    </Badge>
                );
        }
    }

    statusBadge(status) {
        const { lang } = this.context;
        switch (status) {
            case 'open':
                return (
                    <Badge type="secondary">
                        <Dot></Dot>
                        {lang['PENDING_ORDER']}
                    </Badge>
                );
            case 'cancelled':
                return (
                    <Badge type="error">
                        <Dot></Dot>
                        {lang['CANCELLED']}
                    </Badge>
                );
            case 'closed':
                return (
                    <Badge type="secondary">
                        <Dot></Dot>
                        {lang['CLOSED']}
                    </Badge>
                );
        }
    }

    fulfillmentBadge(status) {
        const { lang } = this.context;
        switch (status) {
            case 'fulfilled':
                return (
                    <Badge type="success">
                        <Dot></Dot>
                        {lang['FULFILLMENT_COMPLETE']}
                    </Badge>
                );
            case 'partial':
                return (
                    <Badge
                        style={{
                            backgroundColor: '#FFEA89',
                            color: 'black',
                        }}
                    >
                        <Dot type="error"></Dot>
                        {lang['FULFILLMENT_PARTIALLY_COMPLETE']}
                    </Badge>
                );
            case 'restocked':
                return (
                    <Badge
                        style={{
                            backgroundColor: '#FFEA89',
                            color: 'black',
                        }}
                    >
                        <Dot type="error"></Dot>
                        {lang['FULFILLMENT_RESTOCKED']}
                    </Badge>
                );
        }
    }

    goBack() {
        window.location.href = '/orders';
    }

    cancelOrder = async () => {
        const { lang, storeId } = this.context;
        var confirmation = confirm(lang['CONFIRM_DELETE_ORDER']);
        if (confirmation) {
            this.setState({ cancelLoading: true });
            const { id } = this.props;
            await fetch(`/api/orders/${id.id}/cancel`, {
                method: 'POST',
                headers: {
                    'x-unstock-store': storeId,
                },
            })
                .then((res) => res.json())
                .then(async (body) => {
                    this.setState((prevState) => ({
                        cancelLoading: !prevState.cancelLoading,
                    }));
                    this.componentDidMount();
                })
                .catch(() => {
                    console.log('ERROR: MOSTRAR AL USUARIO');
                    this.setState((prevState) => ({
                        cancelLoading: !prevState.cancelLoading,
                    }));
                });
        }
    };

    closeOrder = async () => {
        const { lang, storeId } = this.context;
        var confirmation = confirm(lang['CONFIRM_COMPLETE_ORDER']);
        if (confirmation) {
            this.setState({ closeLoading: true });
            const { id } = this.props;
            await fetch(`/api/orders/${id.id}/close`, {
                method: 'POST',
                headers: {
                    'x-unstock-store': storeId,
                },
            })
                .then((res) => res.json())
                .then(async (body) => {
                    this.setState((prevState) => ({
                        closeLoading: !prevState.cancelLoading,
                    }));
                    this.componentDidMount();
                })
                .catch(() => {
                    console.log('ERROR: MOSTRAR AL USUARIO');
                    this.setState((prevState) => ({
                        closeLoading: !prevState.cancelLoading,
                    }));
                });
        }
    };

    MarkAsPaid = async () => {
        const { lang, storeId } = this.context;
        var confirmation = confirm(lang['CONFIRM_PAID_ORDER']);
        if (confirmation) {
            this.setState({ paidLoading: true });
            const { id } = this.props;
            await fetch(`/api/orders/${id.id}/paid`, {
                method: 'POST',
                headers: {
                    'x-unstock-store': storeId,
                },
            })
                .then((res) => res.json())
                .then(async (body) => {
                    this.setState((prevState) => ({
                        paidLoading: !prevState.paidLoading,
                    }));
                    this.componentDidMount();
                })
                .catch(() => {
                    console.log('ERROR: MOSTRAR AL USUARIO');
                    this.setState((prevState) => ({
                        paidLoading: !prevState.paidLoading,
                    }));
                });
        }
    };

    onMapLoad = (map) => {
        this.setState({ map });
    };

    render() {
        const { lang } = this.context;
        const order = {
            orderNumber: 'D01',
            status: 'open',
            fullfilmentType: null,
            items: [
                // {
                //     product: { title: 'shimano lure' },
                //     variant: {
                //         variant_1: '',
                //         variant_2: '',
                //         variant_3: '',
                //         price: 10,
                //     },
                //     price: 10.0,
                //     quantity: 1,
                // },
            ],
            paymentMethod: null,
            // paymentMethod: {
            //     name: '',
            //     additionalDetails: '',
            //     paymentInstructions: '',
            // },
            costumer: null,
            //pickupLocation: { name: '', pickupLocation: '' },
            pickupLocation: null,
            address: null,
            // address: {
            //     address1: '',
            //     address2: '',
            //     city: '',
            //     province: '',
            //     deliveryInstructions: '',
            // },
            subtotal: 1,
            tax: 0.07,
            total: 1.07,
        };
        const {
            loading,
            cancelLoading,
            closeLoading,
            loadingView,
            paidLoading,
            map,
        } = this.state;
        console.log(order);
        return (
            <div className={styles['main-content']}>
                <ProductsModal showModal={false} closeModal={null} />
                <ClientsModal showModal={true} closeModal={null} />
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
                                            #{order.orderNumber}
                                        </span>{' '}
                                        {order.date}
                                        {'  '}
                                        {/* {this.finanncialBadge(
                                            order.financialStatus
                                        )}{' '} */}
                                        {this.statusBadge(order.status)}{' '}
                                    </p>
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
                                        {order.items.map((value, key) => {
                                            return (
                                                <RenderOrderItem
                                                    value={value}
                                                    index={key}
                                                    order={order}
                                                    key={key}
                                                />
                                            );
                                        })}
                                    </div>

                                    <div>
                                        {order.status !== 'cancelled' &&
                                            order.status !== 'closed' && (
                                                <Button
                                                    shadow
                                                    type="secondary"
                                                    loading={closeLoading}
                                                    auto
                                                    onClick={() =>
                                                        this.closeOrder()
                                                    }
                                                >
                                                    Agregar productos
                                                </Button>
                                            )}
                                    </div>
                                </div>
                                <Totals
                                    order={order}
                                    paidLoading={paidLoading}
                                    MarkAsPaid={this.MarkAsPaid}
                                />
                            </div>
                            <div>
                                <div className={styles['notes-box']}>
                                    <p>{lang['CUSTOMER']}</p>
                                    <div>
                                        {!order.costumer && (
                                            <Button
                                                shadow
                                                type="secondary"
                                                loading={paidLoading}
                                                onClick={() => MarkAsPaid()}
                                            >
                                                Seleccionar
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <div className={styles['info-box']}>
                                    <p>Opciones de entrega</p>
                                    <Spacer y={0.5} />
                                    <span className={styles['info-box-icon']}>
                                        <Select
                                            placeholder="Choose one"
                                            onChange={null}
                                        >
                                            <Select.Option value="1">
                                                Delivery
                                            </Select.Option>
                                            <Select.Option value="2">
                                                Retiro en tienda
                                            </Select.Option>
                                        </Select>
                                    </span>

                                    {!order.fullfilmentType && (
                                        <div>
                                            <span>Seleccione el cliente</span>
                                        </div>
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
function RenderOrderItem({ value, index, order }) {
    return (
        <div
            key={'item-' + index}
            className={
                index < order.items.length - 1
                    ? styles['info-box-separator']
                    : undefined
            }
        >
            <div>
                <Avatar text="P" isSquare />
            </div>
            <div className={styles['products-variant']}>
                <p>{value.product.title}</p>
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

function Totals({ order, paidLoading, MarkAsPaid }) {
    const { lang } = useContext(DataContext);
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
                            {order.items.length > 1 ? (
                                <span>
                                    {order.items.length} {lang['ITEMS']}
                                </span>
                            ) : (
                                <span>
                                    {order.items.length} {lang['ITEM']}
                                </span>
                            )}
                        </p>
                    </div>
                    <div className={styles['total-box-items-third']}>
                        {' '}
                        <p>${order.subtotal.toFixed(2)}</p>
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
                        <p>({order.tax}%)</p>
                    </div>
                    <div className={styles['total-box-items-third']}>
                        {' '}
                        <p>${(order.subtotal * order.tax).toFixed(2)}</p>
                    </div>
                </div>
                <div>
                    <div className={styles['total-box-items-first']}>
                        <p>Total</p>
                    </div>
                    <div className={styles['total-box-items-second']}> </div>
                    <div className={styles['total-box-items-third']}>
                        {' '}
                        <p>${order.total.toFixed(2)}</p>
                    </div>
                </div>
            </div>
            <div>
                {order.status !== 'cancelled' &&
                    order.status !== 'closed' &&
                    order.financialStatus !== 'paid' && (
                        <Button
                            shadow
                            type="secondary"
                            loading={paidLoading}
                            onClick={() => MarkAsPaid()}
                        >
                            {lang['MARK_AS_PAID']}
                        </Button>
                    )}
            </div>
        </div>
    );
}

function ProductsModal({ showModal, closeModal, product, searchProduct }) {
    const options = [
        <AutoComplete.Option value={product}>
            <Grid.Container style={{ padding: '10pt 0' }}>
                <Grid xs={24}>
                    <Text span b size="1.2rem">
                        Recent search results{' '}
                    </Text>
                </Grid>
                <Grid.Container xs={24}>
                    <Grid xs>
                        <Text span>13 Variantes</Text>
                    </Grid>
                </Grid.Container>
            </Grid.Container>
        </AutoComplete.Option>,
    ];
    return (
        <Modal open={showModal} onClose={closeModal}>
            <Modal.Title>Productos </Modal.Title>
            <Modal.Subtitle>Seleccione un producto a agregar</Modal.Subtitle>
            <Modal.Content>
                {/* <AutoComplete.Option value={product}>
                    <Grid.Container style={{ padding: '10pt 0' }}>
                        <Grid xs={24}>
                            <Text span b size="1.2rem">
                                Recent search results{' '}
                            </Text>
                        </Grid>
                        <Grid.Container xs={24}>
                            <Grid xs>
                                <Text span>13</Text>
                            </Grid>
                            <Grid xs={4}>
                                <Badge type="success">Recommended</Badge>
                            </Grid>
                        </Grid.Container>
                    </Grid.Container>
                </AutoComplete.Option> */}
                <AutoComplete
                    placeholder="Enter here"
                    width="100%"
                    options={options}
                    onSearch={searchProduct}
                />
                <Spacer y={0.5} />
                <Checkbox checked={true} size="large">
                    large
                </Checkbox>
                <Spacer y={0.5} />
                <Checkbox checked={true} size="large">
                    large
                </Checkbox>
                <Spacer y={0.5} />
                <Checkbox checked={true} size="large">
                    large
                </Checkbox>
                <Spacer y={0.5} />
                <Checkbox checked={true} size="large">
                    large
                </Checkbox>
                <Spacer y={0.5} />
                <Checkbox checked={true} size="large">
                    large
                </Checkbox>
            </Modal.Content>
            <Modal.Action passive onClick={() => setState(false)}>
                Cancelar
            </Modal.Action>
            <Modal.Action>Agregar</Modal.Action>
        </Modal>
    );
}

function ClientsModal({ showModal, closeModal, client, searchClient }) {
    const operation = (actions, rowData) => {
        return (
            <Button
                type="success"
                auto
                size="mini"
                onClick={() =>
                    actions.update({
                        property: 'updated',
                        description: 'updated',
                    })
                }
            >
                Seleccionar
            </Button>
        );
    };
    const clients = [
        {
            name: 'Jose Jaen',
            phone: '13123123',
            email: 'jjaen@gmail.com',
            operation,
        },
        {
            name: 'Lucho Perez',
            phone: '4123123',
            email: 'lperez@gmail.com',
            operation,
        },
    ];

    return (
        <Modal open={showModal} onClose={closeModal} width="40rem">
            <Modal.Title>Seleccionar cliente </Modal.Title>
            <Modal.Content>
                <Input placeholder="Buscar cliente..." width="100%" />{' '}
                <Spacer y={0.2} />
                <Table data={clients}>
                    <Table.Column prop="name" label="Nombre" />
                    <Table.Column prop="phone" label="Telefono" />
                    <Table.Column prop="email" label="Email" />
                    <Table.Column prop="operation" label="" />
                </Table>
                <Spacer y={0.5} />
                <Button shadow type="secondary" auto>
                    Nuevo
                </Button>
            </Modal.Content>
            <Modal.Action passive onClick={() => setState(false)}>
                Cancelar
            </Modal.Action>
            <Modal.Action>Agregar</Modal.Action>
        </Modal>
    );
}
