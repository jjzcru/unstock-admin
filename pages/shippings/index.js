import React, { useContext, useState } from 'react';
import dynamic from 'next/dynamic';

import * as Icon from '@geist-ui/react-icons';
import {
    Card,
    Button,
    Input,
    Text,
    Spacer,
    Toggle,
    Textarea,
    useToasts,
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
        filteredZones: [],
        loadingAddLocation: false,
        center: [],
        map: null,
    };

    componentDidMount() {
        const { zones } = this.props;
        if (zones.length && zones[0].path.length) {
            const zone = zones[0];
            const latitude = zone.path[0][0];
            const longitude = zone.path[0][1];
            this.setState({ center: [latitude, longitude] });
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

    onAddPosition = (position) => {
        const { zone } = this.state;
        zone.path.push(position);
        this.setState({ zone });
    };

    onEditClick = (id) => {
        const { zones } = this.state;
        const zone = zones.filter((z) => z.id === id)[0];
        if (zone) {
            const latitude = zone.path[0][0];
            const longitude = zone.path[0][1];
            this.setState({
                editedZone: zone,
                showOption: true,
                filteredZones: [zone],
                zone,
            });
            this.centerMap(latitude, longitude);
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

    onUpdatePosition = (id, latitude, longitude) => {
        const { zones } = this.state;
        const onMap = (p) => {
            if (id === p.id) {
                p.latitude = latitude;
                p.longitude = longitude;
            }
            return p;
        };

        const zone = zones.map(onMap).filter((p) => p.id === id)[0];
        if (pickupLocation) {
            this.setState({
                showOption: true,
                pickupLocation,
                zones: zones.map(onMap),
            });
        }
    };

    onOptionClose = () => {
        const { zones } = this.state;
        console.log(`On Close ZONES: ${zones.length}`);
        this.setState({
            filteredZones: [],
        });
        setTimeout(() => {
            this.setState({
                showOption: false,
                zone: null,
                filteredZones: zones,
                editedZone: null,
            });
        });
    };

    onUpdateZone = (zone) => {
        let { zones } = this.state;

        zones = zones.map((z) => {
            if (z.id === zone.id) {
                return zone;
            }

            return z;
        });

        setTimeout(() => {
            this.setState({
                editedZone: null,
                showOption: false,
                filteredZones: zones,
                zone: null,
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
            zones,
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
                                onAdd={this.onClickAddLocation}
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
                                        setEditedZone={this.setEditedZone}
                                        onAddPosition={this.onAddPosition}
                                        styles={styles}
                                    />
                                    <Options
                                        onUpdate={this.onUpdateZone}
                                        onClose={this.onOptionClose}
                                        display={showOption}
                                        zone={editedZone}
                                    />
                                    <UndoLastLocation
                                        onUndo={this.onUndoLastLocation}
                                        zone={editedZone}
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

function Topbar({ onAdd, zones, loading }) {
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
            ) : zones.length < 15 ? (
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

function Options({ display, zone, onClose, onUpdate }) {
    if (!zone) {
        return null;
    }

    const { storeId } = useContext(AppContext);
    const [loading, setLoading] = useState(false);
    const [isEnabled, setIsEnabled] = useState(zone.isEnabled);
    const [name, setName] = useState(zone.name);

    const onSave = async () => {
        console.log(`-------------------------`);
        console.log(`Save ZONE`);
        console.log(zone);

        setLoading(true);
        try {
            const res = await fetch(`/api/shippings/${zone.id}`, {
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
