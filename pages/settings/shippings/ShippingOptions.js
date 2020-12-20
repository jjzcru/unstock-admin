import React, { useContext, useEffect, useState } from 'react';
import * as Icon from '@geist-ui/react-icons';
import { Button, Text, Loading, Table } from '@geist-ui/react';
import styles from './Shippings.module.css';

import { AppContext } from '@components/shippings/AppContext';

export default function ShippingOptions({ zone, onOpenModal }) {
    const { storeId } = useContext(AppContext);
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async function () {
            let query = await fetch(`/api/shippings/${zone.id}/options`, {
                method: 'GET',
                headers: {
                    'x-unstock-store': storeId,
                },
            });
            setOptions(await query.json());
            setLoading(false);
        })();
    }, [options, loading]);
    const operation = (actions, rowData) => {
        return (
            <Button
                type="secondary"
                auto
                size="mini"
                iconRight={<Icon.Edit />}
                onClick={() => {
                    const index = rowData.row;
                    onOpenModal({
                        zone,
                        shippingOption: options[index],
                        callback: ({ shippingOption }) => {
                            const newOptions = [...options];
                            newOptions.map((option) => {
                                if (option.id === shippingOption.id) {
                                    return shippingOption;
                                }
                                return option;
                            });

                            setOptions(newOptions);
                        },
                    });
                }}
            />
        );
    };
    const data = options.map((option) => {
        const { name } = option;
        return {
            name,
            edit: operation,
        };
    });
    return (
        <div>
            <div className={styles['shipping-options-title']}>
                <Text p className={styles['pickup-location-details']}>
                    Shipping Options{' '}
                    <Button
                        iconRight={<Icon.Plus />}
                        auto
                        size="mini"
                        onClick={() => {
                            onOpenModal({
                                zone,
                                callback: ({ shippingOption }) => {
                                    const newOptions = [...options];
                                    newOptions.push(shippingOption);
                                    setOptions(newOptions);
                                },
                            });
                        }}
                    />
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
