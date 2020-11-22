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
    Col,
    Select,
    Button,
    Input,
    Textarea,
    Badge,
} from '@geist-ui/react';

import lang from '@lang';
import { getSession } from 'next-auth/client';

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
            paymentMethods: [],
        };
    }

    componentDidMount() {
        this.setState({ langName: this.getDefaultLang() });
        localStorage.setItem('storeId', 'f2cf6dde-f6aa-44c5-837d-892c7438ed3d');
        this.getPaymentMethods()
            .then((paymentMethods) => {
                this.setState({ paymentMethods });
            })
            .catch(console.error);
    }

    getDefaultLang = () => {
        if (!localStorage.getItem('lang')) {
            localStorage.setItem('lang', 'es');
        }
        return localStorage.getItem('lang');
    };

    getPaymentMethods = async () => {
        let query = await fetch('/api/payment-methods', {
            method: 'GET',
            headers: {
                'x-unstock-store': localStorage.getItem('storeId'),
            },
        });
        const data = await query.json();
        return data.methods;
    };

    render() {
        const { lang } = this.props;
        const { langName, paymentMethods } = this.state;
        const selectedLang = lang[langName];
        return (
            <div className="container">
                <Navbar lang={selectedLang} />
                <div>
                    <Sidebar lang={selectedLang} />
                    <main className={styles['main']}>
                        <Content
                            lang={selectedLang}
                            paymentMethods={paymentMethods}
                        />
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
            selectedNewType: null,
            newPaymentInfo: {},
            editPaymentMethodInfo: {},
            showPaymentsList: true,
            showNewType: true,
        };
    }

    selectManualPayment = (type) => {
        let info = {};
        switch (type) {
            case 'bank_deposit':
                info = {
                    locked: true,
                    name: 'Bank Deposit',
                    type: type,
                    aditionalDetails: '',
                    paymentInstructions: '',
                };
                break;
            case 'cash_on_delivery':
                info = {
                    locked: true,
                    name: 'Cash On Delivery',
                    type: type,
                    aditionalDetails: '',
                    paymentInstructions: '',
                };
                break;
            case 'money_order':
                info = {
                    locked: true,
                    name: 'Money Order',
                    type: type,
                    aditionalDetails: '',
                    paymentInstructions: '',
                };
                break;
            case 'custom':
                info = {
                    locked: false,
                    name: '',
                    type: type,
                    aditionalDetails: '',
                    paymentInstructions: '',
                };
                break;
        }
        this.setState({
            selectedNewType: type,
            newPaymentInfo: info,
            showPaymentsList: false,
        });
    };

    editManualPayment = (payment) => {
        console.log(payment);
        let info = {};
        switch (payment.type) {
            case 'bank_deposit':
                info = {
                    locked: true,
                    name: 'Bank Deposit',
                    type: payment.type,
                    aditionalDetails: payment.aditionalDetails,
                    paymentInstructions: payment.paymentInstructions,
                    isEnabled: payment.isEnabled,
                    id: payment.id,
                };
                break;
            case 'cash_on_delivery':
                info = {
                    locked: true,
                    name: 'Cash On Delivery',
                    type: payment.type,
                    aditionalDetails: payment.aditionalDetails,
                    paymentInstructions: payment.paymentInstructions,
                    isEnabled: payment.isEnabled,
                    id: payment.id,
                };
                break;
            case 'money_order':
                info = {
                    locked: true,
                    name: 'Money Order',
                    type: payment.type,
                    aditionalDetails: payment.aditionalDetails,
                    paymentInstructions: payment.paymentInstructions,
                    isEnabled: payment.isEnabled,
                    id: payment.id,
                };
                break;
            case 'custom':
                info = {
                    locked: false,
                    name: payment.name,
                    type: payment.type,
                    aditionalDetails: payment.aditionalDetails,
                    paymentInstructions: payment.paymentInstructions,
                    isEnabled: payment.isEnabled,
                    id: payment.id,
                };
                break;
        }
        this.setState({
            editPaymentMethodInfo: info,
            showPaymentsList: false,
            showNewType: false,
        });
    };

    updateNewPaymentInfo = (name, aditionalDetails, paymentInstructions) => {
        let paymentInfo = this.state.newPaymentInfo;
        paymentInfo.name = name;
        paymentInfo.aditionalDetails = aditionalDetails;
        paymentInfo.paymentInstructions = paymentInstructions;
        this.setState({
            newPaymentInfo: paymentInfo,
        });
    };

    updateEditPaymentInfo = (
        name,
        aditionalDetails,
        paymentInstructions,
        isEnabled
    ) => {
        let paymentInfo = this.state.editPaymentMethodInfo;
        paymentInfo.name = name;
        paymentInfo.aditionalDetails = aditionalDetails;
        paymentInfo.paymentInstructions = paymentInstructions;
        paymentInfo.isEnabled = isEnabled;
        console.log(paymentInfo);
        this.setState({
            editPaymentMethodInfo: paymentInfo,
        });
    };

    closeCreatePaymentMethod = () => {
        this.setState({
            selectedNewType: null,
            newPaymentInfo: {},
            showPaymentsList: true,
            showNewType: true,
        });
    };

    createPaymentMethod = async (info) => {
        await fetch(`/api/payment-methods`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-unstock-store': localStorage.getItem('storeId'),
            },
            body: JSON.stringify(info),
        })
            .then((res) => res.json())
            .then(async (body) => {
                this.setState({
                    selectedNewType: null,
                    newPaymentInfo: {},
                    showPaymentsList: true,
                    showNewType: true,
                });
            })
            .catch((e) => {
                console.log(e);
            });
    };

    closeUpdatePaymentMethod = () => {
        this.setState({
            selectedNewType: null,
            newPaymentInfo: {},
            editPaymentMethodInfo: {},
            showPaymentsList: true,
            showNewType: true,
        });
    };

    // updatePaymentMethod = (info) => {
    //     console.log(info);
    //     this.setState({
    //         selectedNewType: null,
    //         newPaymentInfo: {},
    //         editPaymentMethodInfo: {},
    //         showPaymentsList: true,
    //         showNewType: true,
    //     });
    // };

    updatePaymentMethod = async (info) => {
        if (typeof info.isEnabled === 'string') {
            info.isEnabled = info.isEnabled === 'true' ? true : false;
        }
        info.enabled = info.isEnabled;
        console.log(info);
        await fetch(`/api/payment-methods/${info.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-unstock-store': localStorage.getItem('storeId'),
            },
            body: JSON.stringify(info),
        })
            .then((res) => res.json())
            .then(async (body) => {
                this.setState({
                    selectedNewType: null,
                    newPaymentInfo: {},
                    editPaymentMethodInfo: {},
                    showPaymentsList: true,
                    showNewType: true,
                });
            })
            .catch((e) => {
                console.log(e);
            });
    };

    existMethod = (type) => {
        let methods = this.props.paymentMethods;
        let findMethod = methods.find((value) => {
            return value.type === type;
        });
        if (findMethod !== undefined) {
            return true;
        } else {
            return false;
        }
    };

    render() {
        const {
            loading,
            selectedNewType,
            newPaymentInfo,
            editPaymentMethodInfo,
            showPaymentsList,
            showNewType,
        } = this.state;
        const { lang, paymentMethods } = this.props;
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
                                {showNewType && (
                                    <Select
                                        placeholder="Select payment type"
                                        onChange={this.selectManualPayment}
                                    >
                                        <Select.Option
                                            value="bank_deposit"
                                            disabled={this.existMethod(
                                                'bank_deposit'
                                            )}
                                        >
                                            Bank Deposit
                                        </Select.Option>
                                        <Select.Option
                                            value="cash_on_delivery"
                                            disabled={this.existMethod(
                                                'cash_on_delivery'
                                            )}
                                        >
                                            Cash on Delivery
                                        </Select.Option>
                                        <Select.Option
                                            value="money_order"
                                            disabled={this.existMethod(
                                                'money_order'
                                            )}
                                        >
                                            Money Order
                                        </Select.Option>
                                        <Select.Option value="custom">
                                            Custom Solution
                                        </Select.Option>
                                    </Select>
                                )}
                                {selectedNewType && (
                                    <PaymentMethodInfo
                                        lang={lang}
                                        newPaymentInfo={newPaymentInfo}
                                        save={this.createPaymentMethod}
                                        updateNewPaymentInfo={
                                            this.updateNewPaymentInfo
                                        }
                                        closeCreatePaymentMethod={
                                            this.closeCreatePaymentMethod
                                        }
                                    />
                                )}
                                {paymentMethods.length > 0 && showPaymentsList && (
                                    <div>
                                        <Divider />
                                        {paymentMethods.map((value, index) => {
                                            return (
                                                <div key={'method-' + index}>
                                                    {value.isEnabled ? (
                                                        <Badge type="secondary">
                                                            Active
                                                        </Badge>
                                                    ) : (
                                                        <Badge type="error">
                                                            Inactive
                                                        </Badge>
                                                    )}
                                                    <div
                                                        className={
                                                            styles[
                                                                'payment-method-list'
                                                            ]
                                                        }
                                                    >
                                                        <Text>
                                                            {value.name}{' '}
                                                        </Text>
                                                        <div>
                                                            <Button
                                                                auto
                                                                type="secondary"
                                                                onClick={() =>
                                                                    this.editManualPayment(
                                                                        value
                                                                    )
                                                                }
                                                            >
                                                                Setup
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {index <
                                                        paymentMethods.length -
                                                            1 && <Divider />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                {editPaymentMethodInfo.id && (
                                    <EditPaymentMethod
                                        lang={lang}
                                        info={editPaymentMethodInfo}
                                        save={this.updatePaymentMethod}
                                        updateEditPaymentInfo={
                                            this.updateEditPaymentInfo
                                        }
                                        closeUpdatePaymentMethod={
                                            this.closeUpdatePaymentMethod
                                        }
                                    />
                                )}
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

function PaymentMethodInfo({
    lang,
    newPaymentInfo,
    save,
    updateNewPaymentInfo,
    closeCreatePaymentMethod,
}) {
    return (
        <div>
            <Divider />
            <Text b>Name of the Payment Method</Text>
            <Input
                value={newPaymentInfo.name}
                width="100%"
                disabled={newPaymentInfo.locked}
                onChange={(e) =>
                    updateNewPaymentInfo(
                        e.target.value,
                        newPaymentInfo.aditionalDetails,
                        newPaymentInfo.paymentInstructions
                    )
                }
            />
            <Spacer y={1} />
            <Text b>Additional Details</Text>
            <Textarea
                width="100%"
                value={newPaymentInfo.aditionalDetails}
                onChange={(e) =>
                    updateNewPaymentInfo(
                        newPaymentInfo.name,
                        e.target.value,
                        newPaymentInfo.paymentInstructions
                    )
                }
            />
            <Spacer y={1} />
            <Text b>Payment Instructions</Text>
            <Textarea
                width="100%"
                value={newPaymentInfo.paymentInstructions}
                onChange={(e) =>
                    updateNewPaymentInfo(
                        newPaymentInfo.name,
                        newPaymentInfo.aditionalDetails,
                        e.target.value
                    )
                }
            />
            <Spacer y={1} />
            <div className={styles['payment-method-setup-buttons']}>
                <Button auto onClick={() => closeCreatePaymentMethod()}>
                    Cancel
                </Button>
                <Button
                    auto
                    type="secondary-light"
                    onClick={() => save(newPaymentInfo)}
                >
                    Guardar
                </Button>
            </div>
        </div>
    );
}

function EditPaymentMethod({
    lang,
    info,
    save,
    updateEditPaymentInfo,
    closeUpdatePaymentMethod,
}) {
    console.log(info);
    return (
        <div>
            <Divider />
            <Text b>Name of the Payment Method</Text>
            <Input
                value={info.name}
                width="100%"
                disabled={info.locked}
                onChange={(e) =>
                    updateEditPaymentInfo(
                        e.target.value,
                        info.aditionalDetails,
                        info.paymentInstructions,
                        info.isEnabled
                    )
                }
            />
            <Spacer y={1} />
            <Text b>Additional Details</Text>
            <Textarea
                width="100%"
                value={info.aditionalDetails}
                onChange={(e) =>
                    updateEditPaymentInfo(
                        info.name,
                        e.target.value,
                        info.paymentInstructions,
                        info.isEnabled
                    )
                }
            />
            <Spacer y={1} />
            <Text b>Payment Instructions</Text>
            <Textarea
                width="100%"
                value={info.paymentInstructions}
                onChange={(e) =>
                    updateEditPaymentInfo(
                        info.name,
                        info.aditionalDetails,
                        e.target.value,
                        info.isEnabled
                    )
                }
            />
            <Spacer y={1} />
            <div>
                <Text b>Payment method status</Text>
                <Select
                    placeholder="Payment Status"
                    initialValue={info.isEnabled.toString()}
                    onChange={(e) =>
                        updateEditPaymentInfo(
                            info.name,
                            info.aditionalDetails,
                            info.paymentInstructions,
                            e
                        )
                    }
                >
                    <Select.Option value="true">Active</Select.Option>
                    <Select.Option value="false">Inactive</Select.Option>
                </Select>
            </div>
            <Spacer y={1} />
            <div className={styles['payment-method-setup-buttons']}>
                <Button auto onClick={() => closeUpdatePaymentMethod(info)}>
                    Cancel
                </Button>
                <Button auto type="secondary-light" onClick={() => save(info)}>
                    Guardar
                </Button>
            </div>
        </div>
    );
}

function ExistingManualPayments({ lang }) {
    return <div></div>;
}
