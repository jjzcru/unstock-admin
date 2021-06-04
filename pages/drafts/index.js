import React from 'react';
import Link from 'next/link';
import styles from './Drafts.module.css';

import { Sidebar } from '@components/Sidebar';
import { Navbar } from '@components/Navbar';

import {
    Tabs,
    Badge,
    Dot,
    Loading,
    Row,
    Select,
    Input,
    Button,
    Modal,
} from '@geist-ui/react';
import { Search } from '@geist-ui/react-icons';

import moment from 'moment';

import lang from '@lang';
import { useSession, getSession } from 'next-auth/client';
import { getSessionData } from '@utils/session';

export async function getServerSideProps(ctx) {
    const session = await getSession(ctx);
    if (!session) {
        ctx.res.writeHead(302, { Location: '/' }).end();
        return;
    }
    const { storeId } = getSessionData(session);

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
        const { lang, session, storeId } = this.props;
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
                            <Topbar lang={selectedLang} />
                            <Content lang={selectedLang} />
                        </main>
                    </div>
                </div>
            </DataContext.Provider>
        );
    }
}

function Topbar({ lang }) {
    return (
        // <div className={styles['top-bar']}>
        //     <div>
        //         <p>{lang['DRAFT_ORDERS']}</p>
        //     </div>
        // </div>
        <div className={styles['top-bar']}>
            <div className={styles['title']}>
                <h2>{lang['DRAFT_ORDERS']}</h2>
            </div>{' '}
            <div>
                <Link href="/drafts/new">
                    <Button type="secondary" size="small">
                        {lang['CREATE_DRAFT']}
                    </Button>
                </Link>
            </div>
        </div>
    );
}

class Content extends React.Component {
    static contextType = DataContext;
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
        const { storeId } = this.context;
        this.setState({ loading: true });
        // let query = await fetch(
        //     type === null ? `/api/drafts` : `/api/drafts?status=${type}`,
        //     {
        //         method: 'GET',
        //         headers: {
        //             'x-unstock-store': storeId,
        //         },
        //     }
        // );
        let query = await fetch(`/api/drafts`, {
            method: 'GET',
            headers: {
                'x-unstock-store': storeId,
            },
        });
        const data = await query.json();
        this.setState({ loading: false });
        console.log(data);
        return data.drafts;
    };

    setupOrders(type) {
        this.getData(type)
            .then((res) => {
                let orders = [];
                if (res) {
                    orders = res.map((order, index) => {
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
                        return order.financialStatus === filter.toString();
                    });
                } else {
                    results = orders.filter((order) => {
                        return order.financialStatus === null;
                    });
                }
                break;

            case 'fullfilmentStatus':
                if (filter.length > 0) {
                    results = orders.filter((order) => {
                        return order.fulfillmentStatus === filter.toString();
                    });
                } else {
                    results = orders.filter((order) => {
                        return order.fulfillmentStatus === null;
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
                        placeholder={lang['SEARCH_DRAFT']}
                        icon={<Search />}
                        width="100%"
                        defaultValue={this.state.filterValue}
                        onChange={(e) => this.onFilterChange(e.target.value)}
                    />
                );
            case 'createdAt':
                return (
                    <Input
                        placeholder={lang['SEARCH_DRAFT']}
                        icon={<Search />}
                        width="100%"
                        defaultValue={this.state.filterValue}
                        onChange={(e) => this.onFilterChange(e.target.value)}
                    />
                );
            default:
                return (
                    <Input
                        placeholder={lang['SEARCH_DRAFT']}
                        icon={<Search />}
                        width="100%"
                        defaultValue={this.state.filterValue}
                        onChange={(e) => this.onFilterChange(e.target.value)}
                    />
                );
        }
    }

    render() {
        const { loading, filteredOrders, filterValue, filterType } = this.state;
        const { lang } = this.context;
        return (
            <div className={styles['content']}>
                <Tabs
                    initialValue="open"
                    onChange={(e) => this.onChangeTab(e)}
                    className={styles['tabs']}
                >
                    <Tabs.Item label={lang['DRAFT_OPEN']} value="open">
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

                    <Tabs.Item label={lang['DRAFT_PAID']} value="closed">
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
                    <Tabs.Item
                        label={lang['DRAFT_CANCELLED']}
                        value="cancelled"
                    >
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
                </Tabs>
            </div>
        );
    }
}

function Orders({ orders, lang }) {
    console.log(orders);
    return (
        <div>
            {orders.length > 0 ? (
                <table className={styles['table-list']}>
                    <thead className={styles['table-tr']}>
                        <tr>
                            <th></th>
                            <th>{lang['DRAFT_ID']}</th>
                            <th>{lang['DATE']}</th>
                            <th>{lang['CUSTOMER']}</th>
                            <th>{lang['TOTAL']}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order, index) => {
                            return (
                                <Link
                                    href={`/drafts/${order.id}`}
                                    key={'link-' + index}
                                >
                                    <tr
                                        key={'table-' + index}
                                        className={styles['table-row']}
                                    >
                                        <td className={styles['table-row']}>
                                            <input type="checkbox" />
                                        </td>
                                        <td>
                                            <strong>
                                                #{order.orderNumber}
                                            </strong>
                                        </td>
                                        <td>{order.date}</td>
                                        <td>
                                            {!order.costumer
                                                ? 'Por definir'
                                                : `${order.costumer.firstName} ${order.costumer.lastName}`}
                                        </td>
                                        <td
                                            style={{
                                                textAlign: 'right !important',
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            ${order.total.toFixed(2)}
                                        </td>
                                    </tr>
                                </Link>
                            );
                        })}
                    </tbody>
                </table>
            ) : (
                <p>{lang['NO_ORDERS']}</p>
            )}
        </div>
    );
}

function PaymentBadge({ value, lang }) {
    switch (value) {
        case 'paid':
            return (
                <Badge
                    type="success"
                    style={{
                        backgroundColor: 'green',
                    }}
                >
                    <Dot type="secondary"></Dot>
                    {lang['PAYMENT_PAID']}
                </Badge>
            );
        case 'pending':
            return (
                <Badge type="warning">
                    <Dot type="secondary"></Dot>
                    {lang['PAYMENT_PENDING']}
                </Badge>
            );
        default:
            return (
                <Badge
                    style={{
                        textTransform: 'capitalize',
                    }}
                >
                    <Dot></Dot>
                    {value}
                </Badge>
            );
    }
}

function FulfillmentBadge({ value, lang }) {
    switch (value) {
        case null:
            return (
                <Badge type="warning">
                    <Dot type="secondary"></Dot>
                    {lang['PENDING']}
                </Badge>
            );
        case 'fulfilled':
            return (
                <Badge
                    type="secondary"
                    style={{
                        backgroundColor: 'green',
                    }}
                >
                    <Dot></Dot>
                    {lang['FULFILLMENT_COMPLETE']}
                </Badge>
            );
        case 'partial':
            return (
                <Badge type="warning">
                    <Dot type="error"></Dot>
                    {lang['FULFILLMENT_PARTIALLY_COMPLETE']}
                </Badge>
            );
        case 'restocked':
            return (
                <Badge type="error">
                    <Dot></Dot>
                    {lang['FULFILLMENT_RESTOCKED']}
                </Badge>
            );
        default:
            return (
                <Badge
                    style={{
                        textTransform: 'capitalize',
                    }}
                >
                    <Dot type="warning"></Dot>
                    {value}
                </Badge>
            );
    }
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
                        {lang['SEARCH_DRAFT_NUMBER']}
                    </Select.Option>
                    {/* <Select.Option value="createdAt">
                        {lang['SEARCH_DATE']}
                    </Select.Option> */}
                    <Select.Option value="customer">
                        {lang['SEARCH_CUSTOMER']}
                    </Select.Option>
                </Select>
                {renderFilterField(filterType)}
            </div>
        </div>
    );
}
