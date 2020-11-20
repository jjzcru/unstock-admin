import React, { useMemo } from 'react';
import styles from './Billing.module.css';

import { Sidebar } from '@components/Sidebar';
import { Navbar } from '@components/Navbar';

import lang from '@lang';
import { useSession, getSession } from 'next-auth/client';
import moment from 'moment';

import { useDropzone } from 'react-dropzone';

import {
    Card,
    Collapse,
    Text,
    Button,
    Table,
    Divider,
    Spacer,
    Modal,
    Radio,
} from '@zeit-ui/react';

import { Bar } from 'react-chartjs-2';

export async function getServerSideProps(ctx) {
    const session = await getSession(ctx);
    if (!session) {
        ctx.res.writeHead(302, { Location: '/' }).end();
        return;
    }

    return {
        props: { lang },
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
        console.log(bills);
        const selectedLang = lang[langName];
        return (
            <div className="container">
                <Navbar lang={selectedLang} />
                <div>
                    <Sidebar lang={selectedLang} />
                    <main className={styles['main']}>
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
        this.state = {
            showPayModal: false,
            selectedBill: {},
            selectedPaymentType: 'paypal',
        };
        this.closePayModal = this.closePayModal.bind(this);
        this.changePaymentType = this.changePaymentType.bind(this);
    }

    componentDidMount() {}

    closePayModal() {
        this.setState({ showPayModal: false });
    }

    openPayModal(bill) {
        this.setState({ selectedBill: bill, showPayModal: true });
    }

    changePaymentType(type) {
        this.setState({ selectedPaymentType: type });
    }

    render() {
        const { lang, bills } = this.props;
        const { showPayModal, selectedBill, selectedPaymentType } = this.state;
        const pendingBill = bills.find((value) => {
            return value.status === 'pending';
        });
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

        const payedBills = bills
            .filter((bill) => {
                return (
                    bill.status === 'paid' || bill.status === 'partially-paid'
                );
            })
            .map((bill) => {
                return {
                    property:
                        'Factura de Mes: ' +
                        moment(bill.createdAt).format('MMMM'),
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
        return (
            <div className={styles['main']}>
                <PayBill
                    bill={selectedBill}
                    showPayModal={showPayModal}
                    closePayModal={this.closePayModal}
                    selectedPaymentType={selectedPaymentType}
                    changePaymentType={this.changePaymentType}
                />
                <Topbar lang={lang} />
                <div className={styles['bills']}>
                    <Card width="100%">
                        {pendingBill && (
                            <div className={styles['grid-container']}>
                                <div>
                                    <Bar data={chartData} options={options} />
                                </div>
                                <div>
                                    <Text h3>Mes Corriente</Text>
                                    <Collapse.Group
                                        key={pendingBill.id + 'bill'}
                                    >
                                        {pendingBill.items.map(
                                            (value, index) => {
                                                return (
                                                    <Collapse
                                                        key={
                                                            'pendingBill-' +
                                                            index
                                                        }
                                                        title={value.title}
                                                        subtitle={
                                                            <>
                                                                <Text b>
                                                                    $
                                                                    {
                                                                        value.amount
                                                                    }
                                                                </Text>
                                                            </>
                                                        }
                                                    >
                                                        <Text>
                                                            {value.description}
                                                        </Text>
                                                    </Collapse>
                                                );
                                            }
                                        )}
                                    </Collapse.Group>
                                </div>
                            </div>
                        )}
                    </Card>
                    <Spacer y={1} />
                    {bills.map((bill) => {
                        if (bill.status === 'complete') {
                            return (
                                <div key={'bill-' + bill.id}>
                                    <Card width="100%">
                                        <Card.Content>
                                            <Text b>Factura por pagar</Text>
                                        </Card.Content>
                                        <Divider y={0} />
                                        <Card.Content>
                                            {bill.items.map((item, index) => {
                                                return (
                                                    <div
                                                        key={'item-' + item.id}
                                                    >
                                                        {index > 0 && (
                                                            <Divider y={0} />
                                                        )}
                                                        <Text>
                                                            {item.name}{' '}
                                                            <Text b>
                                                                ( ${item.amount}{' '}
                                                                )
                                                            </Text>
                                                        </Text>
                                                        <Text>
                                                            <Text b>
                                                                Detalles:{' '}
                                                            </Text>
                                                            {item.description}
                                                        </Text>
                                                    </div>
                                                );
                                            })}
                                        </Card.Content>
                                        <Card.Footer>
                                            <Button
                                                type="secondary"
                                                onClick={(e) =>
                                                    this.openPayModal(bill)
                                                }
                                            >
                                                Realizar Pago ${bill.amount}
                                            </Button>
                                        </Card.Footer>
                                    </Card>
                                    <Spacer y={1} />
                                </div>
                            );
                        }
                    })}
                </div>
                <div className={styles['previous-bills']}>
                    <Card width="100%">
                        <div>
                            {' '}
                            <Text h3>Facturas</Text>
                            {payedBills.length ? (
                                <Table data={payedBills}>
                                    <Table.Column
                                        prop="property"
                                        label="Cargo"
                                    />
                                    <Table.Column prop="items" label="items" />
                                    <Table.Column prop="amount" label="Total" />
                                    <Table.Column
                                        prop="operation"
                                        label="Estado"
                                        width={150}
                                    />
                                </Table>
                            ) : (
                                <Text>Ningun Pago Realizado</Text>
                            )}
                        </div>
                    </Card>
                </div>
                <Spacer y={1} />
            </div>
        );
    }
}

function PayBill({
    bill,
    showPayModal,
    closePayModal,
    selectedPaymentType,
    changePaymentType,
}) {
    const {
        getRootProps,
        getInputProps,
        open,
        isDragActive,
        isDragAccept,
        isDragReject,
    } = useDropzone({
        accept: 'image/png, image/jpg, image/jpeg',
        maxSize: 2097152,
        multiple: false,
        onDrop: (acceptedFiles) => {
            onDropFiles(
                acceptedFiles.map((file) =>
                    Object.assign(file, {
                        preview: URL.createObjectURL(file),
                    })
                )
            );
        },
    });

    const baseStyle = {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        borderWidth: 2,
        borderRadius: 2,
        borderColor: '#eeeeee',
        borderStyle: 'dashed',
        backgroundColor: '#fafafa',
        color: '#bdbdbd',
        outline: 'none',
        transition: 'border .24s ease-in-out',
    };

    const activeStyle = {
        borderColor: '#2196f3',
    };

    const acceptStyle = {
        borderColor: '#00e676',
    };

    const rejectStyle = {
        borderColor: '#ff1744',
    };
    const style = useMemo(
        () => ({
            ...baseStyle,
            ...(isDragActive ? activeStyle : {}),
            ...(isDragAccept ? acceptStyle : {}),
            ...(isDragReject ? rejectStyle : {}),
        }),
        [isDragActive, isDragReject, isDragAccept]
    );

    return (
        <div>
            <Modal open={showPayModal} onClose={closePayModal}>
                <Modal.Title>${bill.amount}</Modal.Title>
                <Modal.Subtitle>Pagar Factura</Modal.Subtitle>
                <Modal.Content>
                    <div>
                        <Radio.Group
                            value={selectedPaymentType}
                            onChange={changePaymentType}
                        >
                            <Radio value="paypal">Paypal</Radio>
                            <Radio value="bankTransfer">
                                Transferencia Bancaria
                            </Radio>
                        </Radio.Group>
                    </div>
                    {selectedPaymentType === 'bankTransfer' ? (
                        <div>
                            <input {...getInputProps()} />
                            {/* {files.length === 0 && (
                                        
                                    )} */}
                            <div {...getRootProps({ style })}>
                                <p>
                                    Seleccione o Arrastre su comprobante de
                                    pago.
                                </p>
                                {/* <div className={styles['new-product-info-images-box']}>
                                            {files.map((file, key) => {
                                                return (
                                                    <div key={'anchor-' + file.name + key}>
                                                        <Badge.Anchor>
                                                            <Badge
                                                                size="mini"
                                                                type="secondary"
                                                                onClick={(e) => {
                                                                    removeFile(file.id);
                                                                    e.stopPropagation();
                                                                }}
                                                            >
                                                                <img src="./../static/icons/x.svg"></img>
                                                            </Badge>
                                                            <Avatar
                                                                src={file.preview}
                                                                size="large"
                                                                isSquare={true}
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); //ESTO SE CAMBIARA POR EL ORDER
                                                                }}
                                                            />
                                                        </Badge.Anchor>
                                                    </div>
                                                );
                                            })}
                                        </div> */}
                            </div>
                        </div>
                    ) : (
                        <Text>
                            Sera Redirigido al checkout de paypal en el
                            siguiente paso
                        </Text>
                    )}
                </Modal.Content>
                <Modal.Action passive onClick={() => closePayModal()}>
                    Cerrar
                </Modal.Action>
                <Modal.Action>Realizar pago</Modal.Action>
            </Modal>
        </div>
    );
}
