import React from 'react';
import Link from 'next/link';
import styles from './Payments.module.css';

import { Sidebar } from '@components/Sidebar';
import { Navbar } from '@components/Navbar';

import {
    Card,
    Text,
    Divider,
    Spacer,
    Row,
    Col,
    Select,
    Button,
} from '@zeit-ui/react';
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
                        {/*  <Topbar lang={selectedLang} />*/}
                        <Content lang={selectedLang} />
                    </main>
                </div>
            </div>
        );
    }
}

class Content extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
        };
    }

    componentDidMount() {}

    selectManualPayment = (type) => {
        console.log(type);
    };

    render() {
        const { loading } = this.state;
        const { lang } = this.props;

        return (
            <div className={styles['content']}>
                <Topbar lang={lang} />
                <div className={styles['grid-container']}>
                    <div>
                        <Text h3>Accept Payments</Text>
                        <Text>
                            Enable Payment providers to accept credit cards,
                            paypal, other payments methods durin checkout
                        </Text>
                    </div>
                    <div>
                        <Card width="100%">
                            <Card.Content>
                                <Text b>PAYPAL LOGO</Text>
                                <Spacer y={0.4} />
                                <Text>PAYPAL SHIT AQUI!</Text>
                            </Card.Content>
                            <Card.Footer>
                                <Col span={16}>
                                    <Text>Usar: Paypal Express Checkout</Text>
                                </Col>
                                <Col span={8}>
                                    <Button
                                        size="small"
                                        disabled
                                        type="secondary"
                                    >
                                        Configurar
                                    </Button>{' '}
                                </Col>
                            </Card.Footer>
                        </Card>
                        <Spacer y={1} />
                        <Card width="100%">
                            <Card.Content>
                                <Text b>Manual Payment Methods</Text>
                                <Spacer y={0.4} />
                                <Text>
                                    Provide customers with instructions to pay
                                    outside online store. Choose from cash on
                                    delivery, money order, bank deposit or
                                    create a custom solution
                                </Text>
                                <Select
                                    placeholder="Select payment type"
                                    onChange={this.selectManualPayment()}
                                >
                                    <Select.Option value="1">
                                        Bank Deposit
                                    </Select.Option>
                                    <Select.Option value="2">
                                        Cash on Delivery
                                    </Select.Option>
                                    <Select.Option value="2">
                                        Money Order
                                    </Select.Option>
                                    <Select.Option value="2">
                                        Custom Solution
                                    </Select.Option>
                                </Select>
                            </Card.Content>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}

function Topbar({ lang }) {
    return (
        <div className={styles['top-bar']}>
            <div className={styles['title']}>
                <h2>{lang['PAYMENT_METHODS']}</h2>
            </div>
        </div>
    );
}
