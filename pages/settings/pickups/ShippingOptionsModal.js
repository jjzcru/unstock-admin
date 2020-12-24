import React, { useContext, useState } from 'react';
import { Text, Select, Modal } from '@geist-ui/react';
import styles from './Pickups.module.css';

import { AppContext } from '@components/pickups/AppContext';

export default function ShippingOptionsModal({
    location,
    show,
    onClose,
    callback,
    paymentMethods,
}) {
    if (!location || !show) {
        return null;
    }

    const id = location.id;

    const { storeId } = useContext(AppContext);
    const [paymentMethodId, setPaymentMethodId] = useState(
        paymentMethods[0].id
    );
    const [submitLoading, setSubmitLoading] = useState(false);

    const onSubmit = async () => {
        const url = `/api/pickups/${id}/options`;
        setSubmitLoading(true);
        try {
            let res = await fetch(url, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                    'x-unstock-store': storeId,
                },
                body: JSON.stringify({
                    paymentMethodId,
                }),
            });

            const response = await res.json();

            callback({
                shippingOption: response,
            });
            setSubmitLoading(false);
            onClose();
        } catch (e) {
            alert(e.message);
            setSubmitLoading(false);
        }
    };

    return (
        <Modal open={show} onClose={onClose} width={'350px'}>
            <Modal.Title>Shipping Options</Modal.Title>
            <Modal.Content>
                <div className={styles['shippin-option-modal-container']}>
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
                                <Select.Option
                                    key={method.id}
                                    value={method.id}
                                >
                                    {method.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </div>
                </div>
            </Modal.Content>
            <Modal.Action passive onClick={onClose}>
                Cancel
            </Modal.Action>
            <Modal.Action onClick={onSubmit}>
                {submitLoading ? '...' : 'Save'}
            </Modal.Action>
        </Modal>
    );
}
