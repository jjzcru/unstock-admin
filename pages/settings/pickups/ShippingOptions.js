import React, { useContext, useEffect, useState } from 'react';
import * as Icon from '@geist-ui/react-icons';
import { Button, Text, Loading, Table } from '@geist-ui/react';
import styles from './Pickups.module.css';

import { AppContext } from './AppContext';
export default function ShippingOptions({ location, onOpenModal, onDelete }) {
    const { storeId } = useContext(AppContext);
    const [options, setOptions] = useState([]);
    const [paymentMethodMap, setPaymentMethodMap] = useState({});
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [validPaymentMethods, setValidPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async function () {
            let query = await fetch(`/api/pickups/${location.id}/options`, {
                method: 'GET',
                headers: {
                    'x-unstock-store': storeId,
                },
            });
            const options = await query.json();

            query = await fetch(`/api/payment-methods`, {
                method: 'GET',
                headers: {
                    'x-unstock-store': storeId,
                },
            });

            const { methods } = await query.json();

            // We use this hash map to see if the payment method exist
            const optionsMap = options.reduce((acc, option) => {
                acc[option.paymentMethodId] = true;
                return acc;
            }, {});
            setOptions(options);

            setPaymentMethods(methods);
            setValidPaymentMethods(
                methods.filter((method) => !optionsMap[method.id])
            );

            const paymentMethodsMap = methods.reduce((acc, method) => {
                acc[method.id] = method;
                return acc;
            }, {});

            setPaymentMethodMap(paymentMethodsMap);

            setLoading(false);
        })();
    }, []);
    const operation = (actions, rowData) => {
        return (
            <Button
                type="error"
                auto
                size="mini"
                iconRight={<Icon.Trash />}
                onClick={() => {
                    const index = rowData.row;

                    onDelete({
                        option: options[index],
                        callback: (option) => {
                            setOptions(
                                options.filter((o) => o.id !== option.id)
                            );
                            const newValidPaymentMethods = [
                                ...validPaymentMethods,
                            ];
                            newValidPaymentMethods.push(
                                paymentMethodMap[option.paymentMethodId]
                            );
                            setValidPaymentMethods(newValidPaymentMethods);
                        },
                    });
                    // I delete
                    console.log(`I delete`);
                    console.log();
                }}
            />
        );
    };

    const data = options.map((option) => {
        const { paymentMethodId } = option;
        let name = '';
        if (paymentMethodId && paymentMethodMap[`${paymentMethodId}`]) {
            name = paymentMethodMap[`${paymentMethodId}`].name;
        }

        return {
            name,
            edit: operation,
        };
    });

    const callback = ({ shippingOption }) => {
        const newOptions = [...options];
        newOptions.push(shippingOption);
        setOptions(newOptions);
        setValidPaymentMethods(
            validPaymentMethods.filter(
                (method) => method.id !== shippingOption.paymentMethodId
            )
        );
    };

    return (
        <div className={styles['shipping-options-container']}>
            <div className={styles['shipping-options-title']}>
                <Text p className={styles['pickup-location-details']}>
                    Shipping Options{' '}
                    {validPaymentMethods.length ? (
                        <Button
                            iconRight={<Icon.Plus />}
                            auto
                            size="mini"
                            onClick={() => {
                                onOpenModal({
                                    location,
                                    paymentMethods: validPaymentMethods,
                                    callback,
                                });
                            }}
                        />
                    ) : null}
                </Text>
            </div>

            {loading ? (
                <div className={styles['loading-container']}>
                    <Loading />
                </div>
            ) : options.length ? (
                <div className={styles['shipping-options-table']}>
                    <Table data={data}>
                        <Table.Column prop="name" label="Name" />
                        <Table.Column prop="edit" label="Edit" />
                    </Table>
                </div>
            ) : (
                <div className={styles['shipping-options-empty']}>
                    <div>
                        <Icon.Info />
                        <p>Empty shipping options</p>
                    </div>
                </div>
            )}
        </div>
    );
}
