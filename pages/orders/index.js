import React from 'react';
import Link from 'next/link';
import styles from './Orders.module.css';

import { Sidebar } from '@components/Sidebar';
import { Navbar } from '@components/Navbar';

import { Tabs, Badge, Dot, Loading, Row, Select, Input } from '@geist-ui/react';
import { Search } from '@geist-ui/react-icons';

import moment from 'moment';

import lang from '@lang';
import { useSession, getSession } from 'next-auth/client';

export async function getServerSideProps(ctx) {
    const session = await getSession(ctx);
    if (!session) {
        ctx.res.writeHead(302, { Location: '/' }).end();
        return;
    }

    return {
        props: { lang }, // will be passed to the page component as props
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
            filteredOrders: [],
            selectedTab: 'open',
            sortingType: 'date',
            sortingDirection: false,
            filterType: 'order',
            filterValue: '',

            openOrders: [],
            closedOrders: [],
            cancelledOrders: [],
            allOrders: [],
        };
        this.onFilterChange = this.onFilterChange.bind(this);
        this.onChangeFilterType = this.onChangeFilterType.bind(this);
        this.renderFilterField = this.renderFilterField.bind(this);
    }

    componentDidMount() {
        this.setupOrders('open');
    }

    getData = async (type) => {
        this.setState({ loading: true });
        let query = await fetch(
            type === null ? `/api/orders` : `/api/orders?status=${type}`,
            {
                method: 'GET',
                headers: {
                    'x-unstock-store': localStorage.getItem('storeId'),
                },
            }
        );
        const data = await query.json();
        this.setState({ loading: false });
        return data.orders;
    };

    setupOrders(type) {
        this.getData(type)
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

                    this.setState({
                        orders: orders,
                        filteredOrders:
                            type !== null
                                ? orders.filter((order) => {
                                      return order.status === type;
                                  })
                                : orders,
                    });
                }
            })
            .catch(console.error);
    }

    onChangeTab(value) {
        if (value !== this.state.selectedTab) {
            this.setState({ selectedTab: value });
            this.setupOrders(value);
            this.onChangeFilterType('order');
        }
    }

    onFilterChange(value) {
        if (value) {
            this.setState({ filterValue: value });
            let filtered = this.filterOrders(this.state.orders, value);
            this.setState({
                filteredOrders: filtered,
            });
        } else {
            this.setState({
                filteredOrders: this.state.orders,
            });
        }
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
                    return regexp.test(x.email);
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

    onChangeFilterType(value) {
        if (value) {
            this.setState({ filterType: value, filterValue: '' });
            let filtered = this.filterOrders(
                this.state.orders,
                this.state.filterValue
            );
            this.setState({
                filteredOrders: filtered,
            });
        }
    }

    renderFilterField(filterType) {
        const { lang } = this.props;
        switch (filterType) {
            case 'order' || 'customer':
                return (
                    <Input
                        placeholder={lang['SEARCH_ORDERS']}
                        icon={<Search />}
                        width="100%"
                        defaultValue={this.state.filterValue}
                        onChange={(e) => this.onFilterChange(e.target.value)}
                    />
                );
            case 'createdAt':
                return (
                    <Input
                        placeholder={lang['SEARCH_ORDERS']}
                        icon={<Search />}
                        width="100%"
                        defaultValue={this.state.filterValue}
                        onChange={(e) => this.onFilterChange(e.target.value)}
                    />
                );
            case 'paymentStatus':
                return (
                    <Select
                        placeholder={lang['SEARCH_SELECT']}
                        width="100%"
                        onChange={this.onFilterChange}
                    >
                        <Select.Option value="">
                            {lang['PAYMENT_PENDING']}
                        </Select.Option>
                        <Select.Option value="paid">
                            {lang['PAYMENT_PAID ']}
                        </Select.Option>
                        <Select.Option value="refunded">
                            {lang['PAYMENT_REFUNDED']}
                        </Select.Option>
                        <Select.Option value="partially_refunded">
                            {lang['PAYMENT_PARTIALLY_REFUNDED']}
                        </Select.Option>
                        <Select.Option value="partially_paid">
                            {lang['PAYMENT_PARTIALLY_PAID']}
                        </Select.Option>
                    </Select>
                );
            case 'fullfilmentStatus':
                return (
                    <Select
                        placeholder={lang['SEARCH_SELECT']}
                        width="100%"
                        onChange={this.onFilterChange}
                    >
                        <Select.Option value="fulfilled">
                            {lang['FULFILLMENT_COMPLETE']}
                        </Select.Option>
                        <Select.Option value="partial">
                            {lang['FULFILLMENT_PARTIALLY_COMPLETE']}
                        </Select.Option>
                        <Select.Option value="restocked">
                            {lang['FULFILLMENT_RESTOCKED']}
                        </Select.Option>
                    </Select>
                );
            default:
                return (
                    <Input
                        placeholder={lang['SEARCH_ORDERS']}
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
            filteredOrders,
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
                <Tabs
                    initialValue="open"
                    onChange={(e) => this.onChangeTab(e)}
                    className={styles['tabs']}
                >
                    <Tabs.Item label={lang['OPEN']} value="open">
                        {loading ? (
                            <Row style={{ padding: '10px 0' }}>
                                <Loading />
                            </Row>
                        ) : (
                            <div>
                                {' '}
                                <SearchBox
                                    filterValue={filterValue}
                                    onFilterChange={this.onFilterChange}
                                    onChangeFilterType={this.onChangeFilterType}
                                    filterType={filterType}
                                    renderFilterField={this.renderFilterField}
                                    lang={lang}
                                />
                                <Orders orders={filteredOrders} lang={lang} />
                            </div>
                        )}
                    </Tabs.Item>

                    <Tabs.Item label={lang['CLOSED']} value="closed">
                        {loading ? (
                            <Row style={{ padding: '10px 0' }}>
                                <Loading />
                            </Row>
                        ) : (
                            <div>
                                <SearchBox
                                    filterValue={filterValue}
                                    onFilterChange={this.onFilterChange}
                                    onChangeFilterType={this.onChangeFilterType}
                                    filterType={filterType}
                                    renderFilterField={this.renderFilterField}
                                    lang={lang}
                                />
                                <Orders orders={filteredOrders} lang={lang} />
                            </div>
                        )}
                    </Tabs.Item>
                    <Tabs.Item label={lang['CANCELLED']} value="cancelled">
                        {loading ? (
                            <Row style={{ padding: '10px 0' }}>
                                <Loading />
                            </Row>
                        ) : (
                            <div>
                                {' '}
                                <SearchBox
                                    filterValue={filterValue}
                                    onFilterChange={this.onFilterChange}
                                    onChangeFilterType={this.onChangeFilterType}
                                    filterType={filterType}
                                    renderFilterField={this.renderFilterField}
                                    lang={lang}
                                />
                                <Orders orders={filteredOrders} lang={lang} />
                            </div>
                        )}
                    </Tabs.Item>
                    <Tabs.Item label={lang['ALL_ORDERS']} value={null}>
                        {loading ? (
                            <Row style={{ padding: '10px 0' }}>
                                <Loading />
                            </Row>
                        ) : (
                            <div>
                                <SearchBox
                                    filterValue={filterValue}
                                    onFilterChange={this.onFilterChange}
                                    onChangeFilterType={this.onChangeFilterType}
                                    filterType={filterType}
                                    renderFilterField={this.renderFilterField}
                                    lang={lang}
                                />
                                <Orders orders={filteredOrders} lang={lang} />
                            </div>
                        )}
                    </Tabs.Item>
                </Tabs>
            </div>
        );
    }
}

function Orders({ orders, lang }) {
    return (
        <div>
            {orders.length > 0 ? (
                <table className={styles['table-list']}>
                    <thead className={styles['table-tr']}>
                        <tr>
                            <th></th>
                            <th>{lang['ORDER']}</th>
                            <th>{lang['DATE']}</th>
                            <th>{lang['CUSTOMER']}</th>
                            <th>{lang['PAYMENT_STATUS']}</th>
                            <th>{lang['FULFILLMENT_STATUS']}</th>
                            <th>{lang['TOTAL']}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order, index) => {
                            return (
                                <Link
                                    href={`/orders/${order.id}`}
                                    key={'link-' + index}
                                >
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
                                                    lang['PENDING']}
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
                                </Link>
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
    lang,
}) {
    return (
        <div className={styles['search-box']}>
            <div>
                <Select value={'order'} onChange={onChangeFilterType}>
                    <Select.Option value="order">
                        {lang['SEARCH_ORDER_NUMBER']}
                    </Select.Option>
                    <Select.Option value="createdAt">
                        {lang['SEARCH_DATE']}
                    </Select.Option>
                    <Select.Option value="customer">
                        {lang['SEARCH_CUSTOMER']}
                    </Select.Option>
                    <Select.Option value="paymentStatus">
                        {lang['SEARCH_PAYMENT']}
                    </Select.Option>
                    <Select.Option value="fullfilmentStatus">
                        {lang['SEARCH_FULFILLMENT']}
                    </Select.Option>
                </Select>
                {renderFilterField(filterType)}
            </div>
        </div>
    );
}
