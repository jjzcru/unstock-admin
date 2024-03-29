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
    Image,
} from '@geist-ui/react';

import lang from '@lang';
import { getSession } from 'next-auth/client';
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
            paymentMethods: [],
        };
    }

    componentDidMount() {
        this.setState({ langName: this.getDefaultLang() });
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
        const { storeId } = this.props;
        let query = await fetch('/api/payment-methods', {
            method: 'GET',
            headers: {
                'x-unstock-store': storeId,
            },
        });
        const data = await query.json();
        return data.methods;
    };

    render() {
        const { lang, session, storeId } = this.props;
        const { langName, paymentMethods } = this.state;
        const selectedLang = lang[langName];
        return (
            <DataContext.Provider
                value={{
                    lang: selectedLang,
                    storeId: storeId,
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
                            <Content
                                lang={selectedLang}
                                paymentMethods={paymentMethods}
                            />
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
        const { lang } = this.context;
        let info = {};
        switch (type) {
            case 'bank_deposit':
                info = {
                    locked: true,
                    name: lang['BANK_DEPOSIT'],
                    type: type,
                    aditionalDetails: '',
                    paymentInstructions: '',
                };
                break;
            case 'cash_on_delivery':
                info = {
                    locked: true,
                    name: lang['CASH_ON_DELIVERY'],
                    type: type,
                    aditionalDetails: '',
                    paymentInstructions: '',
                };
                break;
            case 'money_order':
                info = {
                    locked: true,
                    name: lang['MONEY_ORDER'],
                    type: type,
                    aditionalDetails: '',
                    paymentInstructions: '',
                };
                break;

            case 'cash':
                info = {
                    locked: true,
                    name: lang['CASH'],
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
        let info = {};
        switch (payment.type) {
            case 'bank_deposit':
                info = {
                    locked: true,
                    name: payment.name,
                    type: payment.type,
                    aditionalDetails: payment.aditionalDetails,
                    paymentInstructions: payment.paymentInstructions,
                    isEnabled: payment.isEnabled,
                    id: payment.id,
                };
                break;
            case 'cash':
                info = {
                    locked: true,
                    name: payment.name,
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
                    name: payment.name,
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
                    name: payment.name,
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
        const { storeId } = this.context;
        await fetch(`/api/payment-methods`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-unstock-store': storeId,
            },
            body: JSON.stringify(info),
        })
            .then((res) => res.json())
            .then(async (body) => {
                // this.setState({
                //     selectedNewType: null,
                //     newPaymentInfo: {},
                //     showPaymentsList: true,
                //     showNewType: true,
                // });
                location.reload();
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
        const { storeId } = this.context;
        if (typeof info.isEnabled === 'string') {
            info.isEnabled = info.isEnabled === 'true' ? true : false;
        }
        info.enabled = info.isEnabled;
        await fetch(`/api/payment-methods/${info.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-unstock-store': storeId,
            },
            body: JSON.stringify(info),
        })
            .then((res) => res.json())
            .then(async (body) => {
                // this.setState({
                //     selectedNewType: null,
                //     newPaymentInfo: {},
                //     editPaymentMethodInfo: {},
                //     showPaymentsList: true,
                //     showNewType: true,
                // });
                location.reload();
            })
            .catch((e) => {
                console.log(e);
            });
    };

    existMethod = (type) => {
        //LOS UNICOS QUE NO APLICAN SON: BANK_TRANSFER, CUSTOM, PROVIDERS ---------- NOTA:AGREGAR LOS OTROS TIPOS
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
        const { paymentMethods } = this.props;
        const { lang } = this.context;
        return (
            <div className={styles['content']}>
                <Topbar lang={lang} />
                <div className={styles['grid-container']}>
                    <div>
                        <Text h3>{lang['ACCEPT_PAYMENTS']}</Text>
                        <Text>{lang['ACCEPT_PAYMENTS_DESCRIPTION']}</Text>
                    </div>
                    <div>
                        {/* <Card width="100%">
                            <Card.Content>
                                <Image
                                    width={540}
                                    height={160}
                                    src="./../static/images/paypal.png"
                                />
                                <Spacer y={0.4} />
                            </Card.Content>
                            <Card.Footer>
                                <Col span={16}>
                                    <Text>
                                        {lang['USE']}: Paypal Express Checkout
                                    </Text>
                                </Col>
                                <Col span={8}>
                                    <Button
                                        size="small"
                                        disabled
                                        type="secondary"
                                    >
                                        {lang['SETUP']}
                                    </Button>{' '}
                                </Col>
                            </Card.Footer>
                        </Card>
                        <Spacer y={1} /> */}
                        <Card width="100%">
                            <Card.Content>
                                <Text b> {lang['MANUAL_PAYMENT_METHODS']}</Text>
                                <Spacer y={0.4} />
                                <Text>
                                    {lang['MANUAL_PAYMENT_METHODS_DESCRIPTION']}
                                </Text>
                                {showNewType && (
                                    <Select
                                        placeholder={
                                            lang['SELECT_PAYMENT_TYPE']
                                        }
                                        onChange={this.selectManualPayment}
                                    >
                                        <Select.Option value="bank_deposit">
                                            {lang['BANK_DEPOSIT']}
                                        </Select.Option>
                                        <Select.Option value="cash_on_delivery">
                                            {lang['CASH_ON_DELIVERY']}
                                        </Select.Option>
                                        <Select.Option value="money_order">
                                            {lang['MONEY_ORDER']}
                                        </Select.Option>
                                        <Select.Option value="cash">
                                            {lang['CASH']}
                                        </Select.Option>
                                        <Select.Option value="custom">
                                            {lang['CUSTOM_SOLUTION']}
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
                                                            {lang['ACTIVE']}
                                                        </Badge>
                                                    ) : (
                                                        <Badge type="error">
                                                            {lang['INACTIVE']}
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
                                                                {lang['SETUP']}
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
            <Text b>{lang['PAYMENT_METHOD_NAME']}</Text>
            <Input
                value={newPaymentInfo.name}
                width="100%"
                // disabled={newPaymentInfo.locked}
                onChange={(e) =>
                    updateNewPaymentInfo(
                        e.target.value,
                        newPaymentInfo.aditionalDetails,
                        newPaymentInfo.paymentInstructions
                    )
                }
            />
            <Spacer y={1} />
            <Text b>{lang['PAYMENT_METHOD_ADITIONALS']}</Text>
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
            <Text b>{lang['PAYMENT_METHOD_INSTRUCTIONS']}</Text>
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
                    {lang['CANCEL']}
                </Button>
                <Button
                    auto
                    type="secondary-light"
                    onClick={() => save(newPaymentInfo)}
                    disabled={
                        newPaymentInfo.name.length === 0 ||
                        newPaymentInfo.aditionalDetails.length === 0 ||
                        newPaymentInfo.paymentInstructions.length === 0
                    }
                >
                    {lang['SAVE']}
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
    return (
        <div>
            <Divider />
            <Text b>{lang['PAYMENT_METHOD_NAME']}</Text>
            <Input
                value={info.name}
                width="100%"
                // disabled={info.locked}
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
            <Text b>{lang['PAYMENT_METHOD_ADITIONALS']}</Text>
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
            <Text b>{lang['PAYMENT_METHOD_INSTRUCTIONS']}</Text>
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
                <Text b>{lang['PAYMENT_METHOD_STATUS']}</Text>
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
                    <Select.Option value="true">{lang['ACTIVE']}</Select.Option>
                    <Select.Option value="false">
                        {lang['INACTIVE']}
                    </Select.Option>
                </Select>
            </div>
            <Spacer y={1} />
            <div className={styles['payment-method-setup-buttons']}>
                <Button auto onClick={() => closeUpdatePaymentMethod(info)}>
                    {lang['CANCEL']}
                </Button>
                <Button
                    auto
                    type="secondary-light"
                    onClick={() => save(info)}
                    disabled={
                        info.name.length === 0 ||
                        info.aditionalDetails.length === 0 ||
                        info.paymentInstructions.length === 0
                    }
                >
                    {lang['SAVE']}
                </Button>
            </div>
        </div>
    );
}

function ExistingManualPayments({ lang }) {
    return <div></div>;
}
