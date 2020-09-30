import React from 'react';
import Link from 'next/link';
import styles from './Orders.module.css';

import { Sidebar } from '@components/Sidebar';
import { Navbar } from '@components/Navbar';

import { Tabs, Badge, Dot } from '@zeit-ui/react';

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
            orders: [],
        };
    }

    componentDidMount() {
        this.getData()
            .then((products) => {
                this.setState({ products });
            })
            .catch(console.error);
    }

    getData = async () => {
        let query = await fetch('/api/orders', {
            method: 'GET',
            headers: {
                'x-unstock-store': localStorage.getItem('storeId'),
            },
        });
        const data = await query.json();
        return data.products;
    };

    render() {
        const { orders } = this.state;
        const { lang } = this.props;
        const data = [
            {
                id: '#1002',
                createdAt: 'Jun 1, 4:21pm',
                costumer: 'Jose Jaen',
                paymentStatus: 'Pending',
                fullfilmentStatus: 'Unfullfiled',
                amount: '$100',
            },
            {
                id: '#1003',
                createdAt: 'Jun 1, 4:21pm',
                costumer: 'Jose Jaen',
                paymentStatus: 'Pending',
                fullfilmentStatus: 'Unfullfiled',
                amount: '$100',
            },
        ];

        return (
            <div className={styles['content']}>
                <Tabs initialValue="open">
                    <Tabs.Item label={lang['OPEN']} value="open">
                        <div className={styles['search-box']}>
                            <div>
                                <select name="filter" id="filter">
                                    <option value="id">Order</option>
                                    <option value="createdAt">Date</option>
                                    <option value="costumer">Costumer</option>
                                    <option value="paymentStatus">
                                        Payment Status
                                    </option>
                                    <option value="fullfilmentStatus">
                                        Fullfilment Status
                                    </option>
                                    <option value="amount">Total</option>
                                </select>
                            </div>
                            <div>
                                <input
                                    className={styles['search-bar']}
                                    placeholder={lang['SEARCH_ORDERS']}
                                />
                            </div>
                        </div>

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
                                {data.map((order, index) => {
                                    return (
                                        <tr
                                            key={'table-' + index}
                                            className={styles['table-row']}
                                        >
                                            <td>
                                                <input type="checkbox" />
                                            </td>
                                            <td>{order.id}</td>
                                            <td>{order.createdAt}</td>
                                            <td>{order.costumer}</td>
                                            <td>
                                                <Badge
                                                    type="warning"
                                                    style={{
                                                        color: 'black',
                                                    }}
                                                >
                                                    <Dot type="error"></Dot>
                                                    {order.paymentStatus}
                                                </Badge>
                                            </td>
                                            <td>
                                                {' '}
                                                <Badge
                                                    style={{
                                                        backgroundColor:
                                                            '#FFEA89',
                                                        color: 'black',
                                                    }}
                                                >
                                                    <Dot type="error"></Dot>
                                                    {order.fullfilmentStatus}
                                                </Badge>
                                            </td>
                                            <td>{order.amount}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </Tabs.Item>
                    <Tabs.Item label={lang['CLOSED']} value="closed">
                        The Fence Jumped over The Evil Rabbit.
                    </Tabs.Item>
                    <Tabs.Item label={lang['CANCELLED']} value="cancelled">
                        The Fence Jumped over The Evil Rabbit.
                    </Tabs.Item>
                    <Tabs.Item label={lang['ALL_ORDERS']} value="all">
                        The Fence Jumped over The Evil Rabbit.
                    </Tabs.Item>
                </Tabs>
            </div>
        );
    }
}
