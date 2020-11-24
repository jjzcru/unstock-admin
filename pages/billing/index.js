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
    Badge,
    Avatar,
    Tag,
} from '@geist-ui/react';

import { Bar } from 'react-chartjs-2';

export async function getServerSideProps(ctx) {
    const session = await getSession(ctx);
    if (!session) {
        ctx.res.writeHead(302, { Location: '/' }).end();
        return;
    }

    return {
        props: { lang, session },
    };
}

const DataContext = React.createContext();

export default class Products extends React.Component {
    static contextType = DataContext;
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

    onSave = (bill, data) => {
        this.setState((prevState) => ({
            loading: !prevState.loading,
        }));
        this.payBill(bill, data)
            .then(() => {
                window.location.href = '/bills';
            })
            .catch((e) => {
                console.log(e);
                //MOSTRAR MENSAJE AL USUARIO
                // this.setState((prevState) => ({
                //     loading: !prevState.loading,
                // }));
            });
    };

    payBill = async (bill, data) => {
        console.log(localStorage.getItem('storeId'));
        // 1. Create product
        const payment = await this.sendPayment(bill, data);
        console.log(payment);
        const { id } = payment;
        console.log(id);
        // 2. Upload image
        await this.uploadImages({
            images: data.images,
            paymentId: id,
        });
    };

    sendPayment = async (bill, data) => {
        console.log(data);

        const res = await fetch(`/api/bills/${bill}`, {
            method: 'put',
            headers: {
                'Content-Type': 'application/json',
                'x-unstock-store': localStorage.getItem('storeId'),
            },
            body: JSON.stringify(data),
        });
        return (await res.json()).payment;
    };

    uploadImages = async ({ images, paymentId }) => {
        const { storeId } = this.props;
        const promises = [];

        for (let imageFile of images) {
            promises.push(
                new Promise(async (resolve, reject) => {
                    try {
                        const formData = new FormData();
                        let contentLength = 0;
                        const { name, buffer, id } = imageFile;
                        const blob = new Blob([buffer]);
                        contentLength += blob.size;
                        formData.append('image', blob, name);

                        const uploadedImages = await this.sendImages({
                            formData,
                            paymentId,
                            storeId,
                        });

                        resolve();
                    } catch (e) {
                        reject(e);
                    }
                })
            );
        }

        await Promise.all(promises);
        return true;
    };

    sendImages = ({ formData, paymentId, storeId }) => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState == XMLHttpRequest.DONE) {
                    const res = JSON.parse(xhr.responseText);
                    if (!!res.error) {
                        reject(new Error(res.error));
                        return;
                    }
                    resolve(res);
                }
            };
            xhr.open('POST', `/api/bills/image/${paymentId}`);
            xhr.setRequestHeader(
                'x-unstock-store',
                localStorage.getItem('storeId')
            );
            xhr.send(formData);
        });
    };

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
        const { lang, session } = this.props;
        const { langName, bills } = this.state;
        const selectedLang = lang[langName];
        return (
            <DataContext.Provider
                value={{
                    onSave: this.onSave,
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
                            <Content lang={selectedLang} bills={bills} />
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
            showPayModal: false,
            showDetailsModal: false,
            selectedBill: {},
            selectedPaymentType: 'paypal',
            files: [],
        };
        this.closePayModal = this.closePayModal.bind(this);
        this.changePaymentType = this.changePaymentType.bind(this);
        this.closeDetailsModal = this.closeDetailsModal.bind(this);
        this.handleCreatePayment = this.handleCreatePayment.bind(this);
    }

    componentDidMount() {}

    closePayModal() {
        this.setState({ showPayModal: false });
    }

    closeDetailsModal() {
        this.setState({ showDetailsModal: false });
    }

    openPayModal(bill) {
        this.setState({ selectedBill: bill, showPayModal: true });
    }

    openDetailsModal(bill) {
        this.setState({ selectedBill: bill, showDetailsModal: true });
    }

    changePaymentType(type) {
        this.setState({ selectedPaymentType: type });
    }

    handleCreatePayment = (bill, info) => {
        const { onSave } = this.context;
        const { files } = this.state;
        info.images = files;
        info.amount = parseFloat(info.amount);

        onSave(bill, info);
    };

    onDrop = async (incommingFiles) => {
        const { files } = this.state;

        for (let file of incommingFiles) {
            if (files.length < 1)
                files.push({
                    name: file.name,
                    buffer: await this.fileToBinary(file),
                    preview: file.preview,
                });
        }
        this.setState({ files });
    };

    removeFile = () => {
        let { files } = this.state;
        files = [];
        this.setState({ files });
    };

    fileToBinary = async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onabort = () =>
                reject(new Error('file reading was aborted'));
            reader.onerror = () => reject(new Error('file reading has failed'));
            reader.onload = () => resolve(reader.result);
            reader.readAsArrayBuffer(file);
        });
    };

    render() {
        const { lang, bills } = this.props;
        const {
            showPayModal,
            showDetailsModal,
            selectedBill,
            selectedPaymentType,
            files,
        } = this.state;
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

        const getBillStatus = (type) => {
            switch (type) {
                case 'complete':
                    return (
                        <Button type="error" size="mini" onClick={() => {}}>
                            Pago Pendiente
                        </Button>
                    );
                case 'paid':
                    return (
                        <Tag type="success" invert>
                            Pagado
                        </Tag>
                    );

                case 'paid-partially':
                    return (
                        <Button type="warning" size="mini" onClick={() => {}}>
                            Pagado Parcialmente
                        </Button>
                    );
            }
        };

        const payedBills = bills
            .filter((bill) => {
                return (
                    bill.status === 'paid' || bill.status === 'partially-paid'
                );
            })
            .map((bill) => {
                return {
                    date: moment(bill.createdAt).format('MMMM'),
                    items: (
                        <Button
                            type="secondary-light"
                            size="mini"
                            onClick={() => {
                                this.openDetailsModal(bill);
                            }}
                        >
                            Mostrar
                        </Button>
                    ),
                    amount: `$${bill.amount}`,
                    operation: getBillStatus(bill.status),
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
                    files={files}
                    onDrop={this.onDrop}
                    removeFile={this.removeFile}
                    handleCreatePayment={this.handleCreatePayment}
                />

                <BillDetails
                    bill={selectedBill}
                    showDetailsModal={showDetailsModal}
                    closeDetailsModal={this.closeDetailsModal}
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
                                        prop="date"
                                        label="Mes de Factura"
                                    />
                                    <Table.Column
                                        prop="items"
                                        label="Detalles"
                                    />
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

function Topbar({ lang }) {
    return (
        <div className={styles['top-bar']}>
            <div className={styles['title']}>
                <h2>{lang['BILLING']}</h2>
            </div>
        </div>
    );
}

function PayBill({
    bill,
    showPayModal,
    closePayModal,
    selectedPaymentType,
    changePaymentType,
    files,
    onDrop,
    removeFile,
    handleCreatePayment,
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
            onDrop(
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
                            <Radio value="bank_deposit">
                                Transferencia Bancaria
                            </Radio>
                        </Radio.Group>
                    </div>
                    {selectedPaymentType === 'bank_deposit' ? (
                        <div>
                            <input {...getInputProps()} />

                            <div {...getRootProps({ style })}>
                                {files.length === 0 && (
                                    <p>
                                        Seleccione o Arrastre su comprobante de
                                        pago.
                                    </p>
                                )}

                                <div>
                                    {files.map((file, key) => {
                                        return (
                                            <div
                                                key={
                                                    'anchor-' + file.name + key
                                                }
                                            >
                                                <Badge.Anchor>
                                                    <Badge
                                                        size="mini"
                                                        type="secondary"
                                                        onClick={(e) => {
                                                            removeFile();
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
                                </div>
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
                <Modal.Action
                    passive
                    onClick={() =>
                        handleCreatePayment(bill.id, {
                            amount: bill.amount,
                            type: selectedPaymentType,
                        })
                    }
                >
                    Realizar pago
                </Modal.Action>
            </Modal>
        </div>
    );
}

function BillDetails({ bill, showDetailsModal, closeDetailsModal }) {
    return (
        <div>
            <Modal open={showDetailsModal} onClose={closeDetailsModal}>
                <Modal.Title>${bill.amount}</Modal.Title>
                <Modal.Subtitle>
                    Factura: {moment(bill.createdAt).format('MMMM')}
                </Modal.Subtitle>
                <Modal.Content>
                    {bill.items &&
                        bill.items.map((value, index) => {
                            return (
                                <div key={'item-' + index}>
                                    <Text b>
                                        {value.name} (${value.amount})
                                    </Text>
                                    <Text>{value.description}</Text>
                                    {index < bill.items.length - 1 && (
                                        <Divider />
                                    )}
                                </div>
                            );
                        })}
                </Modal.Content>
                <Modal.Action passive onClick={() => closeDetailsModal()}>
                    Cerrar
                </Modal.Action>
            </Modal>
        </div>
    );
}
