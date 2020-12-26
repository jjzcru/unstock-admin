import React, { useContext, useState } from 'react';

import * as Icon from '@geist-ui/react-icons';
import { Input, Text, Button, Spacer, Toggle, Card } from '@geist-ui/react';
import styles from './Shippings.module.css';

import { AppContext } from '@components/shippings/AppContext';

import ShippingOptions from './ShippingOptions';

export default function Options({
    display,
    zone,
    onClose,
    onUpdate,
    mode,
    onOpenModal,
}) {
    if (!zone) {
        return null;
    }

    if (zone.path.length < 3) {
        return null;
    }

    const { storeId } = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const [isEnabled, setIsEnabled] = useState(zone.isEnabled);
    const [name, setName] = useState(zone.name);

    const onSave = async () => {
        setLoading(true);
        try {
            const req =
                mode === 'add'
                    ? fetch(`/api/shippings`, {
                          method: 'post',
                          headers: {
                              'Content-Type': 'application/json',
                              'x-unstock-store': storeId,
                          },
                          body: JSON.stringify({
                              name,
                              path: zone.path,
                              isEnabled,
                          }),
                      })
                    : fetch(`/api/shippings/${zone.id}`, {
                          method: 'put',
                          headers: {
                              'Content-Type': 'application/json',
                              'x-unstock-store': storeId,
                          },
                          body: JSON.stringify({
                              name,
                              path: zone.path,
                              isEnabled,
                          }),
                      });
            const res = await req;
            const newZone = await res.json();
            onUpdate(newZone);
        } catch (e) {
            setLoading(false);
            alert(e.message);
        }
    };

    return (
        <div
            className={styles['map-option']}
            style={{ display: display ? 'inline' : 'none' }}
        >
            <div className={styles['shipping-zone-options']}>
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
                        {mode !== 'add' ? <Spacer y={0.5} /> : null}
                        {mode !== 'add' ? (
                            <ShippingOptions
                                zone={zone}
                                onOpenModal={onOpenModal}
                            />
                        ) : null}
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
                        ) : name && zone.path.length > 2 ? (
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
