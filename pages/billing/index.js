import React from 'react';
import styles from './Billing.module.css';

import { Sidebar } from '@components/Sidebar';
import { Navbar } from '@components/Navbar';

import lang from '@lang';
import { useSession, getSession } from 'next-auth/client';

import { Card, Collapse, Text, Button, Table } from '@zeit-ui/react';

import { Bar } from 'react-chartjs-2';

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
            bills: [],
        };
        console.log('here');
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
        const { lang } = this.props;

        const bills = [
            {
                id: 1,
                title: 'Octubre 2020',
                description: 'Comisiones por Ventas ',
                amount: 100.95,
                status: 'pending',
            },
            {
                id: 2,
                title: 'Mensualidad Basica - Octubre 2020',
                description: 'Membresia de tienda',
                amount: 15.0,
                status: 'pending',
            },
            {
                id: 3,
                title: 'Requerimiento de capacidades',
                description:
                    'El cliente solicito ampliar la capacidad de imagenes que puede agregar al producto a 1GB.',
                amount: 1500.0,
                status: 'pending',
            },
        ];
        const chartData = {
            labels: ['Agosto', 'Septiembre', 'Octubre'],
            datasets: [
                {
                    label: 'Monthly Consumption (in USD)',
                    data: [120, 190, 4.58],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                    ],
                    borderWidth: 1,
                },
            ],
        };
        const options = {
            scales: {
                yAxes: [
                    {
                        ticks: {
                            beginAtZero: true,
                        },
                    },
                ],
            },
        };

        const confirmed = (actions, rowData) => {
            return (
                <Button type="success" size="mini" onClick={() => {}}>
                    Confirmado
                </Button>
            );
        };

        const pending = (actions, rowData) => {
            return (
                <Button type="warning" size="mini" onClick={() => {}}>
                    Pendiente Aprobación
                </Button>
            );
        };

        const payedBills = bills.map((bill) => {
            return {
                property: bill.title,
                items: (
                    <Button
                        type="secondary-light"
                        size="mini"
                        onClick={() => {}}
                    >
                        Mostrar
                    </Button>
                ),
                amount: `$${bill.amount}`,
                operation: bill.status === 'pending' ? pending : confirmed,
            };
        });
        console.log(payedBills);
        return (
            <div className={styles['main']}>
                <div className={styles['grid-container']}>
                    <div>
                        <Card type="cyan">
                            <h4>Consumo por Ventas</h4>
                            <span>$4.58</span>
                        </Card>
                        <Card type="error">
                            <h4>Saldo Actual</h4>
                            <span>$1615.95</span>
                        </Card>
                    </div>
                    <div>
                        <Bar data={chartData} options={options} />
                    </div>
                </div>
                <div className={styles['bills']}>
                    <div>
                        <Text h3>Cargos Pendientes</Text>
                        {bills.map((bill) => {
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
                                            consectetur adipiscing elit, sed do
                                            eiusmod tempor incididunt ut labore
                                            et dolore magna aliqua. Ut enim ad
                                            minim veniam, quis nostrud
                                            exercitation ullamco laboris nisi ut
                                            aliquip ex ea commodo consequat.
                                        </Text>
                                        {/* <Button type="secondary">
                                            Realizar Pago ${bill.amount}
                                        </Button> */}
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
                            <Table.Column prop="items" label="items" />
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
