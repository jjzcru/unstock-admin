import React from 'react';
import Link from 'next/link';
import styles from './Settings.module.css';

import { Sidebar } from '@components/Sidebar';
import { Navbar } from '@components/Navbar';

import { Card, Text, Divider, Spacer, Row, Col, User } from '@geist-ui/react';
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

export default class Settings extends React.Component {
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
                        {/*  <Topbar lang={selectedLang} />
                       <Content lang={selectedLang} /> */}
                        <Card width="90%">
                            <Card.Content>
                                <Text b>Settings</Text>
                            </Card.Content>
                            <Divider y={0} />
                            <Card.Content>
                                <Row>
                                    <Col>
                                        <User
                                            src={'/static/icons/settings.svg'}
                                            name={
                                                selectedLang['GENERAL_SETTINGS']
                                            }
                                        >
                                            {
                                                selectedLang[
                                                    'SETTINGS_STORE_DETAILS'
                                                ]
                                            }
                                        </User>
                                    </Col>
                                    <Col>
                                        <Link href={'/settings/payments'}>
                                            <User
                                                src={
                                                    '/static/icons/dollar-sign.svg'
                                                }
                                                name={
                                                    selectedLang[
                                                        'PAYMENT_METHODS'
                                                    ]
                                                }
                                            >
                                                {
                                                    selectedLang[
                                                        'SETTINGS_STORE_PAYMENT_METHODS'
                                                    ]
                                                }
                                            </User>
                                        </Link>
                                    </Col>
                                </Row>
                                <Spacer y={2} />
                                <Row>
                                    <Col>
                                        <Link href={'/settings/shippings'}>
                                            <User
                                                src={'/static/icons/truck.svg'}
                                                name={
                                                    selectedLang[
                                                        'SHIPPING_OPTIONS'
                                                    ]
                                                }
                                            >
                                                {
                                                    selectedLang[
                                                        'SETTINGS_SHIPPING_OPTIONS'
                                                    ]
                                                }
                                            </User>
                                        </Link>
                                    </Col>
                                    <Col>
                                        <Link href={'/settings/pickups'}>
                                            <User
                                                src={
                                                    '/static/icons/map-pin.svg'
                                                }
                                                name={selectedLang['LOCATIONS']}
                                            >
                                                {
                                                    selectedLang[
                                                        'SETTINGS_LOCATIONS'
                                                    ]
                                                }
                                            </User>
                                        </Link>
                                    </Col>
                                </Row>
                            </Card.Content>
                        </Card>
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

    render() {
        const { loading } = this.state;
        const { lang } = this.props;

        return <div className={styles['content']}></div>;
    }
}
