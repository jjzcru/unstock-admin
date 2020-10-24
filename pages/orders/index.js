import React from 'react';
import Link from 'next/link';
import styles from './Orders.module.css';

import { Sidebar } from '@components/Sidebar';
import { Navbar } from '@components/Navbar';

import { Tabs, Badge, Dot, Loading, Row, Select, Input } from '@zeit-ui/react';
import { Search } from '@geist-ui/react-icons';

import moment from 'moment';

import lang from '@lang';

export async function getStaticProps() {
    return {
        props: {
            lang,
        },
    };
}

export default class Products extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            langName: 'es',
        };
    }

    componentDidMount() {
        this.setState({ langName: this.getDefaultLang() });
        localStorage.setItem('storeId', 'f2cf6dde-f6aa-44c5-837d-892c7438ed3d');
    }

    getDefaultLang = () => {
        if (!localStorage.getItem('lang')) {
            localStorage.setItem('lang', 'es');
        }

        return localStorage.getItem('lang');
    };

    render() {
        const { lang } = this.props;
        const { langName } = this.state;
        const selectedLang = lang[langName];
        return (
            <div className="container">
                <Navbar lang={selectedLang} />
                <div>
                    <Sidebar lang={selectedLang} />
                    <main className={styles['main']}>
                        <Topbar lang={selectedLang} />
                        <Content lang={selectedLang} />
                    </main>
                </div>
            </div>
        );
    }
}

function Topbar({ lang }) {
    return (
        <div className={styles['top-bar']}>
            <div>
                <p>{lang['ORDERS']}</p>
            </div>
        </div>
    );
}

class Content extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            orders: [],
            openOrders: [],
            closedOrders: [],
            cancelledOrders: [],
            allOrders: [],
            sortingType: 'date',
            sortingDirection: false,
            filterType: 'order',
            filterValue: '',
            selectedTab: 'open',
        };
        this.onFilterChange = this.onFilterChange.bind(this);
        this.onChangeFilterType = this.onChangeFilterType.bind(this);
        this.renderFilterField = this.renderFilterField.bind(this);
    }

    componentDidMount() {
        this.setState({ loading: true });
        this.getData()
            .then((res) => {
                let orders = [];
                if (res) {
                    orders = res.map((order, index) => {
                        order.orderNumber = (1000 + index).toString();
                        order.date = moment(order.createdAt).format(
                            'DD-MM-YYYY'
                        );
                        return order;
                    });
                    console.log(orders);
                    this.setState({
                        orders: orders,
                        openOrders: orders.filter((order) => {
                            return order.status === 'open';
                        }),
                        closedOrders: orders.filter((order) => {
                            return order.status === 'closed';
                        }),
                        cancelledOrders: orders.filter((order) => {
                            return order.status === 'cancelled';
                        }),
                        allOrders: orders,
                        loading: false,
                    });
                }
            })
            .catch(console.error);
    }

    getData = async () => {
        let query = await fetch(`/api/orders`, {
            method: 'GET',
            headers: {
                'x-unstock-store': localStorage.getItem('storeId'),
            },
        });
        const data = await query.json();
        return data.orders;
    };

    setOrders(orders) {
        this.setState({
            allOrders: orders,
            openOrders: orders.filter((order) => {
                return order.status === 'open';
            }),
            closedOrders: orders.filter((order) => {
                return order.status === 'closed';
            }),
            cancelledOrders: orders.filter((order) => {
                return order.status === 'cancelled';
            }),
        });
    }

    filterOrders(orders, filter) {
        let results = [];
        const regexp = new RegExp(filter.toString(), 'i');
        switch (this.state.filterType) {
            case 'order':
                results = orders.filter((x) => {
                    return regexp.test(x.orderNumber);
                });
                break;

            case 'createdAt':
                results = orders;
                break;

            case 'customer':
                results = orders.filter((x) => {
                    return regexp.test(x.customer);
                });
                break;

            case 'paymentStatus':
                if (filter.length > 0) {
                    results = orders.filter((order) => {
                        order.financialStatus === filter.toString();
                    });
                } else {
                    results = orders.filter((order) => {
                        order.financialStatus === null;
                    });
                }

                break;

            case 'fullfilmentStatus':
                if (filter.length > 0) {
                    results = orders.filter((order) => {
                        order.fulfillmentStatus === filter.toString();
                    });
                } else {
                    results = orders.filter((order) => {
                        order.fulfillmentStatus === null;
                    });
                }
                break;
            default:
                results = orders;
                break;
        }
        return results;
    }

    onFilterChange(value) {
        console.log(value);
        if (value) {
            this.setState({ filterValue: value });
            let filtered = this.filterOrders(this.state.orders, value);
            switch (this.state.selectedTab) {
                case 'open':
                    this.setState({
                        openOrders: filtered,
                    });
                case 'closed':
                    this.setState({
                        closedOrders: filtered,
                    });

                case 'cancelled':
                    this.setState({
                        cancelledOrders: filtered,
                    });
            }
        } else {
            this.setOrders(this.state.orders);
        }
    }

    onChangeTab(value) {
        if (value !== this.state.selectedTab) {
            this.setState({ selectedTab: value });
            this.onFilterChange('');
            //  this.onChangeFilterType('order');
        }
    }

    onChangeFilterType(value) {
        if (value) {
            this.setState({ filterType: value });
            let filtered = this.filterOrders(
                this.state.orders,
                this.state.filterValue
            );
            switch (this.state.selectedTab) {
                case 'open':
                    this.setState({
                        openOrders: filtered,
                    });
                case 'closed':
                    this.setState({
                        closedOrders: filtered,
                    });

                case 'cancelled':
                    this.setState({
                        cancelledOrders: filtered,
                    });
            }
        }
    }

    renderFilterField(filterType) {
        switch (filterType) {
            case 'order' || 'customer':
                return (
                    <Input
                        placeholder="Buscar Ordenes"
                        icon={<Search />}
                        width="100%"
                        defaultValue={this.state.filterValue}
                        onChange={(e) => this.onFilterChange(e.target.value)}
                    />
                );
            case 'createdAt':
                return (
                    <Input
                        placeholder="Buscar Ordenes"
                        icon={<Search />}
                        width="100%"
                        defaultValue={this.state.filterValue}
                        onChange={(e) => this.onFilterChange(e.target.value)}
                    />
                );
            case 'paymentStatus':
                return (
                    <Select
                        placeholder="Seleccione"
                        width="100%"
                        onChange={this.onFilterChange}
                    >
                        <Select.Option value="">Pendiente</Select.Option>
                        <Select.Option value="paid">Pagado</Select.Option>
                        <Select.Option value="refunded">Devuelto</Select.Option>
                        <Select.Option value="partially_refunded">
                            Devuelto Parcialmente
                        </Select.Option>
                        <Select.Option value="partially_paid">
                            Pagado Parcialmente
                        </Select.Option>
                    </Select>
                );
            case 'fullfilmentStatus':
                return (
                    <Select
                        placeholder="Seleccione"
                        width="100%"
                        onChange={this.onFilterChange}
                    >
                        <Select.Option value="fulfilled">
                            Completo
                        </Select.Option>
                        <Select.Option value="partial">
                            Parcialmente Completado
                        </Select.Option>
                        <Select.Option value="restocked">
                            Restocked
                        </Select.Option>
                    </Select>
                );
            default:
                return (
                    <Input
                        placeholder="Buscar Ordenes"
                        icon={<Search />}
                        width="100%"
                        defaultValue={this.state.filterValue}
                        onChange={(e) => this.onFilterChange(e.target.value)}
                    />
                );
        }
    }

    render() {
        const {
            loading,
            openOrders,
            closedOrders,
            cancelledOrders,
            allOrders,
            filterValue,
            filterType,
        } = this.state;
        const { lang } = this.props;

        return (
            <div className={styles['content']}>
                {loading ? (
                    <Row style={{ padding: '10px 0' }}>
                        <Loading />
                    </Row>
                ) : (
                    <Tabs
                        initialValue="open"
                        onChange={(e) => this.onChangeTab(e)}
                        className={styles['tabs']}
                    >
                        <Tabs.Item label={lang['OPEN']} value="open">
                            <SearchBox
                                filterValue={filterValue}
                                onFilterChange={this.onFilterChange}
                                onChangeFilterType={this.onChangeFilterType}
                                filterType={filterType}
                                renderFilterField={this.renderFilterField}
                            />
                            <Orders orders={openOrders} />
                        </Tabs.Item>
                        <Tabs.Item label={lang['CLOSED']} value="closed">
                            <SearchBox
                                filterValue={filterValue}
                                onFilterChange={this.onFilterChange}
                                onChangeFilterType={this.onChangeFilterType}
                                filterType={filterType}
                                renderFilterField={this.renderFilterField}
                            />
                            <Orders orders={closedOrders} />
                        </Tabs.Item>
                        <Tabs.Item label={lang['CANCELLED']} value="cancelled">
                            <SearchBox
                                filterValue={filterValue}
                                onFilterChange={this.onFilterChange}
                                onChangeFilterType={this.onChangeFilterType}
                                filterType={filterType}
                                renderFilterField={this.renderFilterField}
                            />
                            <Orders orders={cancelledOrders} />
                        </Tabs.Item>
                        <Tabs.Item label={lang['ALL_ORDERS']} value="all">
                            <SearchBox
                                filterValue={filterValue}
                                onFilterChange={this.onFilterChange}
                                onChangeFilterType={this.onChangeFilterType}
                                filterType={filterType}
                                renderFilterField={this.renderFilterField}
                            />
                            <Orders orders={allOrders} />
                        </Tabs.Item>
                    </Tabs>
                )}
            </div>
        );
    }
}

function Orders({ orders }) {
    return (
        <div>
            {orders.length > 0 ? (
                <table className={styles['table-list']}>
                    <thead className={styles['table-tr']}>
                        <tr>
                            <th></th>
                            <th>Order</th>
                            <th>Date</th>
                            <th>Costumer</th>
                            <th>Payment Status</th>
                            <th>Fullfilment Status</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order, index) => {
                            return (
                                <tr
                                    key={'table-' + index}
                                    className={styles['table-row']}
                                >
                                    <td className={styles['table-row']}>
                                        <input type="checkbox" />
                                    </td>
                                    <td>#{order.orderNumber}</td>
                                    <td>{order.date}</td>
                                    <td>{order.email}</td>
                                    <td>
                                        <Badge
                                            type="warning"
                                            style={{
                                                color: 'black',
                                            }}
                                        >
                                            <Dot type="error"></Dot>
                                            {order.financialStatus}
                                        </Badge>
                                    </td>
                                    <td>
                                        {' '}
                                        <Badge
                                            style={{
                                                backgroundColor: '#FFEA89',
                                                color: 'black',
                                            }}
                                        >
                                            <Dot type="error"></Dot>
                                            {order.fulfillmentStatus ||
                                                'Pendiente'}
                                        </Badge>
                                    </td>
                                    <td
                                        style={{
                                            textAlign: 'right !important',
                                        }}
                                    >
                                        {order.total.toFixed(2)}{' '}
                                        {order.currency}
                                        {/* TODO: FUNCION PARA BINDEAR CURRENCY */}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            ) : (
                <p>Ninguna orden</p>
            )}
        </div>
    );
}

function SearchBox({
    filterValue,
    onFilterChange,
    onChangeFilterType,
    filterType,
    renderFilterField,
}) {
    return (
        <div className={styles['search-box']}>
            <div>
                <Select value={'order'} onChange={onChangeFilterType}>
                    <Select.Option value="order">Numero de Orden</Select.Option>
                    <Select.Option value="createdAt">Fecha</Select.Option>
                    <Select.Option value="customer">Cliente</Select.Option>
                    <Select.Option value="paymentStatus">
                        Estado del Pago
                    </Select.Option>
                    <Select.Option value="fullfilmentStatus">
                        Estado de Cumplimiento
                    </Select.Option>
                </Select>
                {renderFilterField(filterType)}
            </div>
        </div>
    );
}
