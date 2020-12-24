import React, { useContext, useState } from 'react';

import * as Icon from '@geist-ui/react-icons';
import {
    Card,
    Button,
    Input,
    Text,
    Toggle,
    Textarea,
    Spacer,
} from '@geist-ui/react';
import ShippingOptions from './ShippingOptions';
import styles from './Pickups.module.css';

import { AppContext } from '@components/pickups/AppContext';

export default function Options({
    display,
    location,
    onClose,
    onUpdate,
    onOpenModal,
}) {
    if (!location) {
        return null;
    }

    const { storeId } = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const [isEnabled, setIsEnabled] = useState(location.isEnabled);
    const [name, setName] = useState(location.name);
    const [additionalDetails, setAdditionalDetails] = useState(
        location.additionalDetails
    );

    const onSave = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/pickups/${location.id}`, {
                method: 'put',
                headers: {
                    'Content-Type': 'application/json',
                    'x-unstock-store': storeId,
                },
                body: JSON.stringify({
                    name,
                    additionalDetails,
                    latitude: location.latitude,
                    longitude: location.longitude,
                    isEnabled,
                }),
            });
            const newLocation = await res.json();
            onUpdate(newLocation);
        } catch (e) {
            setLoading(false);
            alert(e.message);
        }
    };

    const onDeleteOption = async ({ option, callback }) => {
        try {
            await fetch(`/api/pickups/${location.id}/options`, {
                method: 'delete',
                headers: {
                    'Content-Type': 'application/json',
                    'x-unstock-store': storeId,
                },
                body: JSON.stringify({
                    paymentMethodId: option.paymentMethodId,
                }),
            });
            callback(option);
        } catch (e) {
            alert(e.message);
        }
    };

    return (
        <div
            className={styles['map-option']}
            style={{ display: display ? 'inline' : 'none' }}
        >
            <div className={styles['pickup-location-options']}>
                <Card shadow>
                    <Icon.XCircle
                        onClick={onClose}
                        className={styles['pickup-location-close']}
                    />
                    <Card.Content className={styles['pickup-location-content']}>
                        <Input
                            onChange={(e) => {
                                setName(e.target.value);
                            }}
                            placeholder="Name"
                            value={name}
                            className={styles['pickup-location-input']}
                        >
                            Name
                        </Input>
                        <Text p className={styles['pickup-location-details']}>
                            Additional Details
                        </Text>
                        <Textarea
                            onChange={(e) => {
                                setAdditionalDetails(e.target.value);
                            }}
                            placeholder="Add additional details"
                            value={additionalDetails}
                        />

                        <Text p className={styles['pickup-location-details']}>
                            Enable
                        </Text>
                        {isEnabled ? (
                            <Toggle
                                initialChecked
                                onChange={() => setIsEnabled(false)}
                                className={styles['toggle-checked']}
                            />
                        ) : (
                            <Toggle
                                onChange={() => setIsEnabled(true)}
                                className={styles.toggle}
                            />
                        )}
                        <Spacer y={0.5} />
                        <ShippingOptions
                            onDelete={onDeleteOption}
                            location={location}
                            onOpenModal={onOpenModal}
                        />
                    </Card.Content>
                    <Card.Footer
                        style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                        }}
                    >
                        {loading ? (
                            <Button
                                auto
                                size="medium"
                                loading
                                disabled
                                type="secondary"
                            >
                                Save
                            </Button>
                        ) : name ? (
                            <Button
                                onClick={onSave}
                                auto
                                size="medium"
                                type="secondary"
                            >
                                Save
                            </Button>
                        ) : (
                            <Button
                                auto
                                disabled
                                size="medium"
                                type="secondary"
                            >
                                Save
                            </Button>
                        )}
                    </Card.Footer>
                </Card>
            </div>
        </div>
    );
}
