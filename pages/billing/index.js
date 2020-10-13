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
        const confirmed = (actions, rowData) => {
            return (
                <Button
                    type="success"
                    size="mini"
                    onClick={() => actions.remove()}
                >
                    Confirmado
                </Button>
            );
        };

        const pending = (actions, rowData) => {
            return (
                <Button
                    type="secondary"
                    size="mini"
                    onClick={() => actions.remove()}
                >
                    Pendiente
                </Button>
            );
        };

        const data = [
            {
                property: 'Mensualidad Enero',
                description: 'Plan basico.',
                amount: '$15.00',
                operation: confirmed,
            },
            {
                property: 'Porcentaje por ventas',
                description: '2%',
                amount: '$2.00',
                operation: confirmed,
            },
            {
                property: 'Mensualidad Febrero',
                description: 'Plan basico.',
                amount: '$15.00',
                operation: confirmed,
            },
            {
                property: 'Porcentaje por ventas',
                description: '2%',
                amount: '$2.00',
                operation: pending,
            },
            {
                property: 'Mensualidad Marzo',
                description: 'Plan basico.',
                amount: '$15.00',
                operation: pending,
            },
            {
                property: 'Porcentaje por ventas',
                description: '2%',
                amount: '$2.00',
                operation: pending,
            },
        ];
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
                        <Collapse.Group>
                            <Collapse
                                title={'Mensualidad Enero 2020'}
                                subtitle={
                                    <>
                                        Cargo mensual por uso de herramienta
                                        (plan basico).{' '}
                                        <Text b>Monto: $15.00</Text>
                                    </>
                                }
                            >
                                <Text>
                                    Lorem ipsum dolor sit amet, consectetur
                                    adipiscing elit, sed do eiusmod tempor
                                    incididunt ut labore et dolore magna aliqua.
                                    Ut enim ad minim veniam, quis nostrud
                                    exercitation ullamco laboris nisi ut aliquip
                                    ex ea commodo consequat.
                                </Text>
                                <Button type="secondary">
                                    Realizar Pago $15.00
                                </Button>
                            </Collapse>
                            <Collapse
                                title={'Porcentajes por ventas (2%)'}
                                subtitle={
                                    <>
                                        Total de comision:{' '}
                                        <Text b> $2.00 - Mes de Octubre</Text>
                                    </>
                                }
                            >
                                <Text>
                                    Lorem ipsum dolor sit amet, consectetur
                                    adipiscing elit, sed do eiusmod tempor
                                    incididunt ut labore et dolore magna aliqua.
                                    Ut enim ad minim veniam, quis nostrud
                                    exercitation ullamco laboris nisi ut aliquip
                                    ex ea commodo consequat.
                                </Text>
                                <Button type="secondary">
                                    Realizar Pago $2.00
                                </Button>
                            </Collapse>
                        </Collapse.Group>
                    </div>
                </div>
                <div className={styles['previous-bills']}>
                    <div>
                        {' '}
                        <Text h3>Pagos Realizados</Text>
                        <Table data={data}>
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
