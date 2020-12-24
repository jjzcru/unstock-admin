import React, { useContext, useEffect, useState } from 'react';
import {
    Input,
    Text,
    Select,
    Spacer,
    Toggle,
    Textarea,
    Modal,
    Loading,
} from '@geist-ui/react';
import styles from './Shippings.module.css';

import { AppContext } from '@components/shippings/AppContext';

export default function ShippingOptionsModal({
    zone,
    show,
    onClose,
    callback,
    shippingOption,
}) {
    if (!zone || !show) {
        return null;
    }

    const id = shippingOption && shippingOption.id ? shippingOption.id : null;

    const { storeId } = useContext(AppContext);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [name, setName] = useState(
        shippingOption ? shippingOption.name : '-'
    );
    const [additionalDetails, setAdditionalDetails] = useState(
        shippingOption ? shippingOption.additionalDetails : ''
    );
    const [price, setPrice] = useState(
        shippingOption ? shippingOption.price : 0.0
    );
    const [isEnabled, setIsEnabled] = useState(
        shippingOption ? shippingOption.isEnabled : true
    );
    const [paymentMethodId, setPaymentMethodId] = useState(
        shippingOption ? shippingOption.paymentMethodId : null
    );

    useEffect(() => {
        (async function () {
            let query = await fetch(`/api/payment-methods`, {
                method: 'GET',
                headers: {
                    'x-unstock-store': storeId,
                },
            });
            const response = await query.json();
            const methods = response.methods;
            setPaymentMethods(methods);
            setLoading(false);
            if (methods.length && paymentMethodId === null) {
                setPaymentMethodId(methods[0].id);
            }
        })();
    }, [paymentMethods, loading]);

    const isValid =
        !!name.length && !loading && /^(?:[1-9]\d*|0)?(?:\.\d+)?$/.test(price);

    const content = loading ? (
        <div className={styles['loading-container']}>
            <Loading />
        </div>
    ) : (
        <div className={styles['shippin-option-modal-container']}>
            <Input
                status={name.length ? 'secondary' : 'error'}
                onChange={(e) => {
                    setName(e.target.value);
                }}
                value={name}
                className={styles['shipping-option-modal-name-input']}
            >
                Name
            </Input>
            {id ? <Spacer y={0.5} /> : null}
            {id ? (
                <Text p className={styles['pickup-location-details']}>
                    Enabled
                </Text>
            ) : null}
            {id ? (
                <div
                    className={
                        styles[
                            isEnabled
                                ? 'shipping-option-modal-toggle'
                                : 'shipping-option-modal-toggle-off'
                        ]
                    }
                >
                    {isEnabled ? (
                        <Toggle
                            initialChecked
                            size="large"
                            onChange={(e) => {
                                setIsEnabled(e.target.checked);
                            }}
                        />
                    ) : (
                        <Toggle
                            size="large"
                            onChange={(e) => {
                                setIsEnabled(e.target.checked);
                            }}
                        />
                    )}
                </div>
            ) : null}

            <Text p className={styles['pickup-location-details']}>
                Payment Methods
            </Text>
            <div className={styles['shipping-option-modal-select']}>
                <Select
                    value={paymentMethodId}
                    onChange={(e) => {
                        setPaymentMethodId(e);
                    }}
                >
                    {paymentMethods.map((method) => (
                        <Select.Option key={method.id} value={method.id}>
                            {method.name}
                        </Select.Option>
                    ))}
                </Select>
            </div>
            <Spacer y={0.5} />
            <Spacer y={0.5} />
            <Input
                status={
                    /^(?:[1-9]\d*|0)?(?:\.\d+)?$/.test(`${price}`) &&
                    !!`${price}`
                        ? 'secondary'
                        : 'error'
                }
                onChange={(e) => {
                    setPrice(
                        e.target.value
                            .replace(/[-]/gi, '')
                            .replace(/[a-zA-Z]/gi, '')
                            .trim()
                    );
                }}
                value={price}
                className={styles['shipping-option-modal-name-input']}
            >
                Price
            </Input>
            <Text p className={styles['pickup-location-details']}>
                Additional Details
            </Text>
            <div className={styles['shipping-option-modal-text-area']}>
                <Textarea
                    value={additionalDetails}
                    onChange={(e) => {
                        setAdditionalDetails(e.target.value);
                    }}
                />
            </div>
        </div>
    );

    return (
        <Modal open={show} onClose={onClose} width={'350px'}>
            <Modal.Title>Shipping Options</Modal.Title>
            <Modal.Content>{content}</Modal.Content>
            <Modal.Action passive onClick={onClose}>
                Cancel
            </Modal.Action>
            {isValid ? (
                <Modal.Action
                    onClick={async () => {
                        let mode = 'add';

                        if (shippingOption && shippingOption.id) {
                            mode = 'edit';
                        }

                        setSubmitLoading(true);

                        console.log(`MODE: ${mode}`);
                        const body = JSON.stringify({
                            name,
                            isEnabled,
                            paymentMethodId,
                            price: parseFloat(price),
                            additionalDetails,
                        });
                        const url =
                            mode === 'add'
                                ? `/api/shippings/${zone.id}/options`
                                : `/api/shippings/${zone.id}/options/${shippingOption.id}`;
                        try {
                            let res = await fetch(url, {
                                method: mode === 'add' ? 'post' : 'put',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'x-unstock-store': storeId,
                                },
                                body,
                            });

                            const response = await res.json();

                            callback({
                                mode,
                                shippingOption: response,
                            });
                            setSubmitLoading(false);
                            onClose();
                        } catch (e) {
                            alert(e.message);
                            setSubmitLoading(false);
                        }
                    }}
                >
                    {submitLoading ? '...' : 'Save'}
                </Modal.Action>
            ) : (
                <Modal.Action disabled>Save</Modal.Action>
            )}
        </Modal>
    );
}
