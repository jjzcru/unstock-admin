import React from 'react';
import styles from './Billing.module.css';

import { Sidebar } from '@components/Sidebar';
import { Navbar } from '@components/Navbar';

import lang from '@lang';

import { Card, Collapse, Text, Button, Table } from '@zeit-ui/react';

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
            bills: [],
        };
    }

    componentDidMount() {
        this.setState({ langName: this.getDefaultLang() });
        localStorage.setItem('storeId', 'f2cf6dde-f6aa-44c5-837d-892c7438ed3d');
        this.getBills()
            .then((bills) => {
                this.setState({ bills });
            })
            .catch(console.error);
    }

    getDefaultLang = () => {
        if (!localStorage.getItem('lang')) {
            localStorage.setItem('lang', 'es');
        }
        return localStorage.getItem('lang');
    };

    getBills = async () => {
        let query = await fetch('/api/bills', {
            method: 'GET',
            headers: {
                'x-unstock-store': localStorage.getItem('storeId'),
            },
        });
        const data = await query.json();
        return data.bills;
    };

    render() {
        const { lang } = this.props;
        const { langName, bills } = this.state;
        const selectedLang = lang[langName];
        return (
            <div className="container">
                <Navbar lang={selectedLang} />
                <div>
                    <Sidebar lang={selectedLang} />
                    <main className={styles['main']}>
                        <Topbar lang={selectedLang} />
                        <Content lang={selectedLang} bills={bills} />
                    </main>
                </div>
            </div>
        );
    }
}

function Topbar({ lang }) {
    return (
        <div className={styles['top-bar']}>
            <div className={styles['title']}>
                <h2>{lang['BILLING']}</h2>
            </div>
        </div>
    );
}

class Content extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {}

    render() {
        const { lang, bills } = this.props;
        const confirmed = (actions, rowData) => {
            return (
                <Button type="success" size="mini" onClick={() => {}}>
                    Confirmado
                </Button>
            );
        };

        const pending = (actions, rowData) => {
            return (
                <Button type="secondary" size="mini" onClick={() => {}}>
                    Pendiente Aprobación
                </Button>
            );
        };

        const payedBills = bills.map((bill) => {
            if (bill.payments)
                return {
                    property: bill.title,
                    description: bill.description,
                    amount: `$${bill.amount}`,
                    operation: bill.status === 'pending' ? pending : confirmed,
                };
        });

        return (
            <div>
                <div className={styles['grid-container']}>
                    <div>
                        <Card type="cyan">
                            <h4>Saldo Actual</h4>
                            <span>$0.00</span>
                        </Card>
                    </div>
                    <div>
                        <Card type="error">
                            <h4>Saldo Actual</h4>
                            <span>$0.00</span>
                        </Card>
                    </div>
                </div>
                <div className={styles['bills']}>
                    <div>
                        <Text h3>Pagos Pendientes</Text>
                        {bills.map((bill) => {
                            if (bill.payments.length === 0)
                                return (
                                    <Collapse.Group key={bill.id + 'bill'}>
                                        <Collapse
                                            title={bill.title}
                                            subtitle={
                                                <>
                                                    {bill.description}{' '}
                                                    <Text b>
                                                        Total: ${bill.amount}
                                                    </Text>
                                                </>
                                            }
                                        >
                                            <Text>
                                                Lorem ipsum dolor sit amet,
                                                consectetur adipiscing elit, sed
                                                do eiusmod tempor incididunt ut
                                                labore et dolore magna aliqua.
                                                Ut enim ad minim veniam, quis
                                                nostrud exercitation ullamco
                                                laboris nisi ut aliquip ex ea
                                                commodo consequat.
                                            </Text>
                                            <Button type="secondary">
                                                Realizar Pago ${bill.amount}
                                            </Button>
                                        </Collapse>
                                    </Collapse.Group>
                                );
                        })}
                    </div>
                </div>
                <div className={styles['previous-bills']}>
                    <div>
                        {' '}
                        <Text h3>Pagos Realizados</Text>
                        <Table data={payedBills}>
                            <Table.Column prop="property" label="Cargo" />
                            <Table.Column
                                prop="description"
                                label="Descripcion"
                            />
                            <Table.Column prop="amount" label="Total" />
                            <Table.Column
                                prop="operation"
                                label="Estado"
                                width={150}
                            />
                        </Table>
                    </div>
                </div>
            </div>
        );
    }
}
