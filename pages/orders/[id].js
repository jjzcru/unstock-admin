import React, { useState, useContext, useMemo, useCallback } from 'react';

import { useRouter } from 'next/router';
import styles from './Orders.module.css';

import { Sidebar } from '@components/Sidebar';
import { Navbar } from '@components/Navbar';

import { Dot, Badge, Button, Avatar } from '@zeit-ui/react';

import lang from '@lang';

export async function getServerSideProps(ctx) {
    const storeId = 'f2cf6dde-f6aa-44c5-837d-892c7438ed3d'; // I get this from a session
    let id = null;
    try {
        id = ctx.params;
    } catch (e) {
        console.error(e);
    }
    return {
        props: { lang, id }, // will be passed to the page component as props
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
        const { lang, id } = this.props;
        const { langName } = this.state;
        const selectedLang = lang[langName];

        return (
            <DataContext.Provider
                value={{
                    lang: selectedLang,
                }}
            >
                <div className="container">
                    <Navbar lang={selectedLang} />
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
    }

    componentDidMount() {
        const { id } = this.props;
    }

    render() {
        const { lang } = this.context;
        const { id } = this.props;
        return (
            <div className={styles['main-content']}>
                <div className={styles['top-bar-navi']}>
                    <div className={styles['top-bar']}>
                        <div>
                            <button> &lt; {lang['ORDERS']}</button>
                            <p>
                                <span className={styles['top-bar-order']}>
                                    #1001
                                </span>{' '}
                                Jan 1, 2020 at 5:03 pm{'  '}
                                <Badge
                                    type="warning"
                                    style={{
                                        color: 'black',
                                    }}
                                >
                                    <Dot type="error"></Dot>
                                    Pending
                                </Badge>{' '}
                                <Badge
                                    style={{
                                        backgroundColor: '#FFEA89',
                                        color: 'black',
                                    }}
                                >
                                    <Dot type="error"></Dot>
                                    Unfulfilled
                                </Badge>
                            </p>
                        </div>
                    </div>
                </div>
                <div className={styles['grid-container']}>
                    <div>
                        <div className={styles['products-box']}>
                            <p>Unfulfilled (2)</p>
                            <div className={styles['products-box-items']}>
                                <div className={styles['info-box-separator']}>
                                    <div>
                                        <Avatar
                                            src="../static/icons/reports.svg"
                                            isSquare
                                        />
                                    </div>
                                    <div className={styles['products-variant']}>
                                        <p>Product 1</p>
                                        <p>Variant</p>
                                    </div>
                                    <div>$100.00 x 1</div>
                                    <div>$100.00</div>
                                </div>
                                <div>
                                    <div>
                                        <Avatar
                                            src="../static/icons/reports.svg"
                                            isSquare
                                        />
                                    </div>
                                    <div className={styles['products-variant']}>
                                        <p>Product 2</p>
                                        <p>Variant</p>
                                    </div>
                                    <div>$100.00 x 1</div>
                                    <div>$100.00</div>
                                </div>
                            </div>
                            <div>
                                <Button shadow type="secondary">
                                    Mark As Fulfilled
                                </Button>
                            </div>
                        </div>
                        <div className={styles['total-box']}>
                            <p>Pending</p>
                            <div className={styles['total-box-items']}>
                                <div>
                                    <div
                                        className={
                                            styles['total-box-items-first']
                                        }
                                    >
                                        <p>Subtotal</p>
                                    </div>
                                    <div
                                        className={
                                            styles['total-box-items-second']
                                        }
                                    >
                                        {' '}
                                        <p>2 Items</p>
                                    </div>
                                    <div
                                        className={
                                            styles['total-box-items-third']
                                        }
                                    >
                                        {' '}
                                        <p>$100.00</p>
                                    </div>
                                </div>
                                <div>
                                    <div
                                        className={
                                            styles['total-box-items-first']
                                        }
                                    >
                                        <p>Tax</p>
                                    </div>
                                    <div
                                        className={
                                            styles['total-box-items-second']
                                        }
                                    >
                                        {' '}
                                        <p>ITBMS (7%)</p>
                                    </div>
                                    <div
                                        className={
                                            styles['total-box-items-third']
                                        }
                                    >
                                        {' '}
                                        <p>$7.00</p>
                                    </div>
                                </div>
                                <div>
                                    <div
                                        className={
                                            styles['total-box-items-first']
                                        }
                                    >
                                        <p>Total</p>
                                    </div>
                                    <div
                                        className={
                                            styles['total-box-items-second']
                                        }
                                    >
                                        {' '}
                                    </div>
                                    <div
                                        className={
                                            styles['total-box-items-third']
                                        }
                                    >
                                        {' '}
                                        <p>$17.00</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <Button shadow type="secondary">
                                    Mark as Paid
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className={styles['notes-box']}>
                            <p>Notes</p>
                            <div>
                                <p>Any notes from customer</p>
                            </div>
                        </div>
                        <div className={styles['info-box']}>
                            <p>Customer</p>
                            <div className={styles['info-box-separator']}>
                                <p>Link to Customer</p>
                            </div>
                            <p>Contact Information</p>
                            <div className={styles['info-box-separator']}>
                                <p>Email Address</p>
                                <p>Phone Number</p>
                            </div>
                            <p>Shipping Address</p>
                            <div>
                                <p>
                                    Details of the shipping address separated by
                                    breaklines
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
