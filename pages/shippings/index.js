import React, { useContext, useState } from 'react';
import dynamic from 'next/dynamic';
import polylabel from 'polylabel';

import * as Icon from '@geist-ui/react-icons';
import {
    Card,
    Button,
    Input,
    Text,
    Spacer,
    Toggle,
    Textarea,
    Modal,
    Checkbox,
    useToasts,
    Table,
} from '@geist-ui/react';
import styles from './Shippings.module.css';

const Map = dynamic(() => import('./Map'), { ssr: false });

import { Sidebar } from '@components/Sidebar';
import { Navbar } from '@components/Navbar';
import { GetShippingZones } from '@domain/interactors/ShippingUseCases';

import { AppContext } from './AppContext';

import lang from '@lang';
import { useSession, getSession } from 'next-auth/client';

function replacer(key, value) {
    if (typeof value === 'Date') {
        return value.toString();
    }
    return value;
}

export async function getServerSideProps(ctx) {
    const session = await getSession(ctx);
    if (!session) {
        ctx.res.writeHead(302, { Location: '/' }).end();
        return;
    }

    const storeId = 'f2cf6dde-f6aa-44c5-837d-892c7438ed3d';

    const useCase = new GetShippingZones(storeId);
    const zones = await useCase.execute();

    return {
        props: {
            lang,
            storeId,
            zones: JSON.parse(JSON.stringify(zones, replacer)),
        }, // will be passed to the page component as props
    };
}

export default class Shippings extends React.Component {
    state = {
        langName: 'es',
        showOption: false,
        mapId: Math.random(),
        pickupLocation: null,
        zones: [],
        zone: null,
        editedZone: null,
        beforeEditZone: null,
        filteredZones: [],
        loadingAddLocation: false,
        center: [],
        zoom: 15,
        mode: null,
        showModal: false,
        map: null,
    };

    componentDidMount() {
        const { zones } = this.props;
        if (zones.length) {
            const zoom = zones.length === 1 ? 15 : 12;
            this.setState({
                center: this.calculateZonesCenter(zones),
                zoom,
            });
        } else {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { coords } = position;
                    const { latitude, longitude } = coords;
                    this.setState({ center: [latitude, longitude] });
                },
                () => {
                    this.setState({ center: [0, 0] });
                }
            );
        }
        this.setState({ zones, filteredZones: zones });
    }

    onClickPaymentOptions = (zone) => {
        this.setState({ showModal: true, editedZone: zone });
    };

    onClosePaymentOptionsModal = () => {
        this.setState({ showModal: false });
    };

    calculateZonesCenter = (zones) => {
        let latitude = 0;
        let longitude = 0;
        if (zones.length === 1) {
            const zone = zones[0];
            latitude = zone.path[0][0];
            longitude = zone.path[0][1];
            return [latitude, longitude];
        }

        const centers = [];
        for (const zone of zones) {
            if (zone.path.length > 2) {
                const zoneCenter = polylabel([zone.path], 1.0);
                if (zoneCenter && zoneCenter.length === 2) {
                    const center = [zoneCenter[0], zoneCenter[1]];
                    centers.push(center);
                }
            }
        }

        if (centers.length < 2) {
            const zonesCenter = polylabel([centers], 1.0);
            if (zonesCenter && zonesCenter.length === 2) {
                latitude = zonesCenter[0];
                longitude = zonesCenter[1];
            }
        } else {
            latitude = (centers[0][0] + centers[1][0]) / 2;
            longitude = (centers[0][1] + centers[1][1]) / 2;
        }

        return [latitude, longitude];
    };

    setEditedZone = (editedZone) => {
        this.setState({
            editedZone,
        });
    };

    centerMap = (latitude, longitude) => {
        const { map } = this.state;
        if (map) {
            map.setView({ lat: latitude, lng: longitude }, 15);
        }
    };

    onMapLoad = (map) => {
        this.setState({ map });
    };

    onAddZoneClick = () => {
        const zone = {
            id: uuidv4(),
            name: '-',
            path: [],
            isEnabled: true,
        };
        this.setState({
            mode: 'add',
            editedZone: zone,
            filteredZones: [zone],
            zone: zone,
            showOption: true,
            zoom: 15,
        });
    };

    onAddPosition = (position) => {
        const { zone } = this.state;
        zone.path.push(position);
        this.setState({ zone });
    };

    onEditClick = (id) => {
        const { zones } = this.state;
        const zone = zones.filter((z) => z.id === id)[0];
        if (zone) {
            let latitude = zone.path[0][0];
            let longitude = zone.path[0][1];
            if (zone.path.length > 2) {
                const p = polylabel([zone.path], 1.0);
                if (p && p.length === 2) {
                    latitude = p[0];
                    longitude = p[1];
                }
            }

            const beforeEditZone = Object.assign({}, zone);

            this.setState({
                editedZone: zone,
                beforeEditZone,
                mode: 'edit',
                showOption: true,
                filteredZones: [zone],
                zone,
            });
            this.centerMap(latitude, longitude);
        }
    };

    onDeleteClick = async (zone) => {
        const { storeId } = this.props;
        let { zones } = this.state;

        if (zone) {
            const res = await fetch(`/api/shippings/${zone.id}`, {
                method: 'delete',
                headers: {
                    'Content-Type': 'application/json',
                    'x-unstock-store': storeId,
                },
            });

            zone = await res.json();
            zones = zones.filter((z) => z.id !== zone.id);

            setTimeout(() => {
                this.setState({
                    zones,
                    filteredZones: zones,
                    mode: null,
                });
            }, 500);
        }
    };

    onAddLocation = (location) => {
        const { zones } = this.state;
        const { latitude, longitude } = location;
        zones.push(location);
        this.setState({
            loadingAddLocation: false,
            zones,
            mapId: Math.random(),
            center: [latitude, longitude],
        });
    };

    onOptionClose = () => {
        let { zones, beforeEditZone, mode } = this.state;
        this.setState({
            filteredZones: [],
        });
        this.setState({
            mode: null,
        });
        if (mode === 'add') {
            this.setState({
                showOption: false,
                zone: null,
                filteredZones: zones,
                editedZone: null,
                beforeEditZone: null,
            });
        } else {
            zones = zones.map((z) => {
                if (beforeEditZone.id === z.id) {
                    return beforeEditZone;
                }
                return z;
            });

            setTimeout(() => {
                this.setState({
                    showOption: false,
                    zone: null,
                    filteredZones: zones,
                    editedZone: null,
                    beforeEditZone: null,
                });
            });
        }
    };

    onUpdateZone = (zone) => {
        let { zones, mode } = this.state;
        if (mode === 'add') {
            zones.push(zone);
        } else {
            zones = zones.map((z) => {
                if (z.id === zone.id) {
                    return zone;
                }

                return z;
            });
        }

        setTimeout(() => {
            this.setState({
                editedZone: null,
                showOption: false,
                filteredZones: zones,
                zone: null,
                mode: null,
                beforeEditZone: null,
                zones: zones,
            });
        }, 1000);
    };

    onUndoLastLocation = () => {
        const { editedZone } = this.state;
        const path = [...editedZone.path];
        path.pop();
        editedZone.path = path;

        this.setState({
            editedZone,
            zone: editedZone,
        });
    };

    onSavePaymentMethod = (paymentMethods) => {
        this.setState({
            showModal: false,
        });
    };

    render() {
        const {
            langName,
            showOption,
            mapId,
            center,
            editedZone,
            zone,
            loadingAddLocation,
            filteredZones,
            showModal,
            zones,
            mode,
            zoom,
        } = this.state;
        const selectedLang = this.props.lang[langName];

        return (
            <div className="container">
                <AppContext.Provider
                    value={{
                        locale: selectedLang,
                        storeId: this.props.storeId,
                    }}
                >
                    <Navbar lang={selectedLang} />
                    <div>
                        <Sidebar lang={selectedLang} />
                        <main className={styles.main}>
                            <Topbar
                                loading={loadingAddLocation}
                                zones={zones}
                                mode={mode}
                                onAdd={this.onAddZoneClick}
                            />

                            <div className={styles['map-options-container']}>
                                <div
                                    style={{
                                        width: '100%',
                                        position: 'relative',
                                    }}
                                >
                                    <Map
                                        center={center}
                                        onLoad={this.onMapLoad}
                                        zone={zone}
                                        onEdit={this.onEditClick}
                                        zones={filteredZones}
                                        id={mapId}
                                        zoom={zoom}
                                        onDelete={this.onDeleteClick}
                                        setEditedZone={this.setEditedZone}
                                        onAddPosition={this.onAddPosition}
                                        styles={styles}
                                    />
                                    <Options
                                        onUpdate={this.onUpdateZone}
                                        onClose={this.onOptionClose}
                                        display={showOption}
                                        zone={editedZone}
                                        onClickPayment={
                                            this.onClickPaymentOptions
                                        }
                                        mode={mode}
                                    />
                                    <UndoLastLocation
                                        onUndo={this.onUndoLastLocation}
                                        zone={editedZone}
                                    />
                                    <PaymentMethodsModal
                                        zone={editedZone}
                                        show={showModal}
                                        onCancel={
                                            this.onClosePaymentOptionsModal
                                        }
                                        onSave={this.onSavePaymentMethod}
                                    />
                                </div>
                            </div>
                        </main>
                    </div>
                </AppContext.Provider>
            </div>
        );
    }
}

function Topbar({ onAdd, zones, loading, mode }) {
    const { locale } = useContext(AppContext);
    return (
        <div className={styles['top-bar']}>
            <div className={styles.title}>
                <h2>{locale.PICKUP_LOCATION_TITLE}</h2>
            </div>
            {loading ? (
                <Button auto size="medium" loading disabled type="secondary">
                    Add
                </Button>
            ) : zones.length < 15 && mode === null ? (
                <Button onClick={onAdd} auto size="medium" type="secondary">
                    Add
                </Button>
            ) : (
                <Button auto disabled size="medium" type="secondary">
                    Add
                </Button>
            )}
        </div>
    );
}

function Options({ display, zone, onClose, onUpdate, mode, onClickPayment }) {
    if (!zone) {
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
                              isEnabled: zone.isEnabled,
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
                              isEnabled: zone.isEnabled,
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
                            <Button
                                auto
                                onClick={() => {
                                    onClickPayment(zone);
                                }}
                            >
                                Set Payment Methods
                            </Button>
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

function UndoLastLocation({ zone, onUndo }) {
    if (!zone) {
        return null;
    }

    if (!zone.path.length) {
        return null;
    }

    return (
        <div className={styles['map-undo-last-location']} onClick={onUndo}>
            <Icon.Rewind />
        </div>
    );
}

function PaymentMethodsModal({ show, onCancel, onSave, zone }) {
    if (!zone) {
        return null;
    }
    const { name } = zone;
    const paymentMethods = [
        {
            id: '1',
            name: 'Banistmo',
            selected: true,
            type: 'bank_deposit',
        },
        {
            id: '2',
            name: 'Cash',
            selected: false,
            type: 'cash',
        },
    ];
    const operation = (actions, rowData) => {
        const index = rowData.row;
        return (
            <Checkbox
                checked={paymentMethods[index].selected}
                size="mini"
                onChange={(e) => {
                    paymentMethods[index].selected = e.target.checked;
                }}
            />
        );
    };
    const data = paymentMethods.map((p) => {
        const { name, type } = p;
        return {
            name,
            type,
            operation,
        };
    });
    return (
        <Modal open={show} onClose={onCancel} width={'600px'}>
            <Modal.Title>Payment Methods</Modal.Title>
            <Modal.Subtitle>
                Set payment methods for: <b>{name}</b>
            </Modal.Subtitle>
            <Modal.Content>
                <Table data={data}>
                    <Table.Column prop="name" label="name" />
                    <Table.Column prop="type" label="type" />
                    <Table.Column
                        prop="operation"
                        label="operation"
                        width={150}
                    />
                </Table>
            </Modal.Content>
            <Modal.Action passive onClick={onCancel}>
                Cancel
            </Modal.Action>
            <Modal.Action
                onClick={() => {
                    onSave(paymentMethods);
                }}
            >
                Submit
            </Modal.Action>
        </Modal>
    );
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (
        c
    ) {
        var r = (Math.random() * 16) | 0,
            v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
