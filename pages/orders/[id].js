import React, { useState, useContext, useMemo, useCallback } from 'react';

import Link from 'next/link';

import styles from './Orders.module.css';

import { Sidebar } from '@components/Sidebar';
import { Navbar } from '@components/Navbar';

import moment from 'moment';

import { Dot, Badge, Button, Avatar, Row, Loading } from '@geist-ui/react';

import lang from '@lang';
import { useSession, getSession } from 'next-auth/client';

export async function getServerSideProps(ctx) {
    const session = await getSession(ctx);
    if (!session) {
        ctx.res.writeHead(302, { Location: '/' }).end();
        return;
    }
    const storeId = 'f2cf6dde-f6aa-44c5-837d-892c7438ed3d'; // I get this from a session
    let id = null;
    try {
        id = ctx.params;
    } catch (e) {
        console.error(e);
    }
    return {
        props: { lang, id, session }, // will be passed to the page component as props
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
        const { lang, id, session } = this.props;
        const { langName } = this.state;
        const selectedLang = lang[langName];

        return (
            <DataContext.Provider
                value={{
                    lang: selectedLang,
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
        };
    }

    componentDidMount() {
        this.setState({ loadingView: true });
        const { id } = this.props;
        this.getOrders(id.id)
            .then((order) => {
                order.date = moment(order.createdAt).format('lll');
                this.setState({
                    order: order,
                    loadingView: false,
                });
            })
            .catch(console.error);
    }

    getOrders = async (id) => {
        let query = await fetch(`/api/orders/${id}`, {
            method: 'GET',
            headers: {
                'x-unstock-store': localStorage.getItem('storeId'),
            },
        });
        const data = await query.json();
        console.log(data.order);
        return data.order;
    };

    statusBadge(status) {
        const { lang } = this.context;
        switch (status) {
            case 'open':
                return (
                    <Badge
                        type="warning"
                        style={{
                            color: 'black',
                        }}
                    >
                        <Dot type="error"></Dot>
                        {lang['PENDING']}
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
        const { lang } = this.context;
        var confirmation = confirm(lang['CONFIRM_DELETE_ORDER']);
        if (confirmation) {
            this.setState({ cancelLoading: true });
            const { id } = this.props;
            await fetch(`/api/orders/${id.id}/cancel`, {
                method: 'POST',
                headers: {
                    'x-unstock-store': localStorage.getItem('storeId'),
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
        const { lang } = this.context;
        var confirmation = confirm(lang['CONFIRM_COMPLETE_ORDER']);
        if (confirmation) {
            this.setState({ closeLoading: true });
            const { id } = this.props;
            await fetch(`/api/orders/${id.id}/close`, {
                method: 'POST',
                headers: {
                    'x-unstock-store': localStorage.getItem('storeId'),
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

    render() {
        const { lang } = this.context;
        const {
            order,
            loading,
            cancelLoading,
            closeLoading,
            loadingView,
        } = this.state;
        return (
            <div className={styles['main-content']}>
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
                                        &lt; {lang['ORDERS']}
                                    </button>
                                    <p>
                                        <span
                                            className={styles['top-bar-order']}
                                        >
                                            #{order.orderNumber}
                                        </span>{' '}
                                        {order.date}
                                        {'  '}
                                        {this.statusBadge(order.status)}{' '}
                                        {this.fulfillmentBadge(
                                            order.fulfillmentStatus
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className={styles['grid-container']}>
                            <div>
                                <div className={styles['products-box']}>
                                    <p>
                                        {order.fulfillmentStatus === null
                                            ? lang['PENDING']
                                            : order.fulfillmentStatus}{' '}
                                        ({order.items.length})
                                    </p>
                                    <div
                                        className={styles['products-box-items']}
                                    >
                                        {order.items.map((value, key) => {
                                            return (
                                                <div
                                                    key={'item-' + key}
                                                    className={
                                                        key <
                                                        order.items.length - 1
                                                            ? styles[
                                                                  'info-box-separator'
                                                              ]
                                                            : undefined
                                                    }
                                                >
                                                    <div>
                                                        <Avatar
                                                            src={
                                                                value.product
                                                                    .images[0]
                                                                    .image || ''
                                                            }
                                                            isSquare
                                                        />
                                                    </div>
                                                    <div
                                                        className={
                                                            styles[
                                                                'products-variant'
                                                            ]
                                                        }
                                                    >
                                                        <p>
                                                            {
                                                                value.product
                                                                    .title
                                                            }
                                                        </p>
                                                        <p>
                                                            {
                                                                value.variant
                                                                    .title
                                                            }
                                                        </p>
                                                    </div>
                                                    <div>
                                                        ${value.variant.price} x{' '}
                                                        {value.quantity}
                                                    </div>
                                                    <div>
                                                        $
                                                        {(
                                                            value.variant
                                                                .price *
                                                            value.quantity
                                                        ).toFixed(2)}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div>
                                        {order.status !== 'cancelled' &&
                                            order.status !== 'closed' && (
                                                <Button
                                                    shadow
                                                    type="error"
                                                    loading={cancelLoading}
                                                    onClick={() =>
                                                        this.cancelOrder()
                                                    }
                                                    ghost
                                                    auto
                                                >
                                                    {lang['CANCEL_ORDER']}
                                                </Button>
                                            )}

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
                                                    {lang['CLOSE_ORDER']}
                                                </Button>
                                            )}
                                    </div>
                                </div>
                                <div className={styles['total-box']}>
                                    <p>{lang['PAYMENT_STATUS']}</p>
                                    <div className={styles['total-box-items']}>
                                        <div>
                                            <div
                                                className={
                                                    styles[
                                                        'total-box-items-first'
                                                    ]
                                                }
                                            >
                                                <p>Subtotal</p>
                                            </div>
                                            <div
                                                className={
                                                    styles[
                                                        'total-box-items-second'
                                                    ]
                                                }
                                            >
                                                {' '}
                                                <p>
                                                    {order.items.length > 1 ? (
                                                        <span>
                                                            {order.items.length}{' '}
                                                            {lang['ITEMS']}
                                                        </span>
                                                    ) : (
                                                        <span>
                                                            {order.items.length}{' '}
                                                            {lang['ITEM']}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                            <div
                                                className={
                                                    styles[
                                                        'total-box-items-third'
                                                    ]
                                                }
                                            >
                                                {' '}
                                                <p>
                                                    $
                                                    {order.total -
                                                        order.total * order.tax}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <div
                                                className={
                                                    styles[
                                                        'total-box-items-first'
                                                    ]
                                                }
                                            >
                                                <p>{lang['TAX']}</p>
                                            </div>
                                            <div
                                                className={
                                                    styles[
                                                        'total-box-items-second'
                                                    ]
                                                }
                                            >
                                                {' '}
                                                <p>({order.tax}%)</p>
                                            </div>
                                            <div
                                                className={
                                                    styles[
                                                        'total-box-items-third'
                                                    ]
                                                }
                                            >
                                                {' '}
                                                <p>
                                                    $
                                                    {order.subtotal * order.tax}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <div
                                                className={
                                                    styles[
                                                        'total-box-items-first'
                                                    ]
                                                }
                                            >
                                                <p>Total</p>
                                            </div>
                                            <div
                                                className={
                                                    styles[
                                                        'total-box-items-second'
                                                    ]
                                                }
                                            >
                                                {' '}
                                            </div>
                                            <div
                                                className={
                                                    styles[
                                                        'total-box-items-third'
                                                    ]
                                                }
                                            >
                                                {' '}
                                                <p>${order.total}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        {order.status !== 'cancelled' &&
                                            order.status !== 'closed' && (
                                                <Button
                                                    shadow
                                                    type="secondary"
                                                    disabled
                                                >
                                                    {lang['MARK_AS_PAID']}
                                                </Button>
                                            )}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className={styles['notes-box']}>
                                    <p>{lang['ORDER_NOTES']}</p>
                                    <div>
                                        <p>
                                            {order.message
                                                ? order.message
                                                : lang['ORDER_NO_NOTES']}
                                        </p>
                                    </div>
                                </div>
                                <div className={styles['info-box']}>
                                    <p>{lang['CUSTOMER']}</p>
                                    <div
                                        className={styles['info-box-separator']}
                                    >
                                        <p>Link to Customer</p>
                                    </div>
                                    <p>{lang['ORDER_CONTACT']}</p>
                                    <div
                                        className={styles['info-box-separator']}
                                    >
                                        <p>{order.costumer.email}</p>
                                        <p>{order.costumer.phone}</p>
                                    </div>
                                    <p>
                                        {order.shippingOption
                                            ? lang['ORDER_SHIPPING']
                                            : lang['PICKUP_LOCATION']}
                                    </p>
                                    <div>
                                        {order.shippingOption ? (
                                            <span>NO SHIPPING INFO YET</span>
                                        ) : (
                                            <p>{order.pickupLocation.name}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}
