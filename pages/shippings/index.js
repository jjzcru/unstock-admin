import React, { useContext, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import polylabel from 'polylabel';

import * as Icon from '@geist-ui/react-icons';
import {
    Card,
    Button,
    Input,
    Text,
    Select,
    Spacer,
    Toggle,
    Textarea,
    Modal,
    Checkbox,
    Loading,
    Spinner,
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
        shippingOption: null,
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

    onClickPaymentOptions = async (zone) => {
        const { storeId } = this.props;
        let { zones } = this.state;

        if (zone) {
            try {
                let res = await fetch(`/api/payment-methods`, {
                    method: 'get',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-unstock-store': storeId,
                    },
                });
                const paymentMethods = await res.json();
                const { methods } = paymentMethods;

                res = await fetch(`/api/shippings/${zone.id}/options`, {
                    method: 'get',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-unstock-store': storeId,
                    },
                });
                const shippingOptions = await res.json();

                this.setState({
                    paymentMethods: methods,
                    shippingOptions,
                    showModal: true,
                    editedZone: zone,
                });
            } catch (e) {
                alert(e.message);
            }
        }
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

    onOpenModal = ({ zone, callback, shippingOption }) => {
        this.setState({
            editedZone: zone,
            showModal: true,
            onSaveModalCallback: callback,
            shippingOption: shippingOption,
        });
    };

    onCloseShippingOptionModal = () => {
        this.setState({ showModal: false });
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
            shippingOption,
            mode,
            shippingOptionmode,
            zoom,
            onSaveModalCallback,
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
                                        onOpenModal={this.onOpenModal}
                                        mode={mode}
                                    />
                                    <UndoLastLocation
                                        onUndo={this.onUndoLastLocation}
                                        zone={editedZone}
                                    />
                                    <ShippingOptionsModal
                                        zone={editedZone}
                                        show={showModal}
                                        shippingOption={shippingOption}
                                        callback={onSaveModalCallback}
                                        onClose={
                                            this.onCloseShippingOptionModal
                                        }
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

function Options({ display, zone, onClose, onUpdate, mode, onOpenModal }) {
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

function ShippingOptions({ zone, onOpenModal }) {
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

function ShippingOptionsModal({
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
                        console.log(e);
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

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
        /[xy]/g,
        function (c) {
            var r = (Math.random() * 16) | 0,
                v = c == 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        }
    );
}

function hasSameProps(obj1, obj2) {
    var obj1Props = Object.keys(obj1),
        obj2Props = Object.keys(obj2);

    if (obj1Props.length == obj2Props.length) {
        return obj1Props.every(function (prop) {
            return obj2Props.indexOf(prop) >= 0;
        });
    }

    return false;
}

function getByProperty(items, property, value) {
    for (let item of items) {
        if (item[property] === value) {
            return item;
        }
    }

    return null;
}
