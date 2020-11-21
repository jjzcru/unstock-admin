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

export default class Pickups extends React.Component {
    state = {
        langName: 'es',
        showOption: false,
        mapId: Math.random(),
        pickupLocation: null,
        zones: [],
        loadingAddLocation: false,
        center: [],
        map: null,
    };

    componentDidMount() {
        const { zones } = this.props;
        this.setState({ zones });
    }

    onMapLoad = (map) => {
        this.setState({ map });
    };

    onToggleShowOption = () => {
        const { showOption } = this.state;
        this.setState({ showOption: !showOption, mapId: Math.random() });
    };

    getCurrentPosition = () => {
        const { zones } = this.state;
        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { coords } = position;
                    const { latitude, longitude } = coords;
                    resolve({ latitude, longitude });
                },
                () => {
                    if (zones.length) {
                        const path = zones[0];

                        const { latitude, longitude } = location;
                        resolve({ latitude, longitude });
                    } else {
                        resolve({ latitude: 0, longitude: 0 });
                    }
                }
            );
        });
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

        const pickupLocation = zones.map(onMap).filter((p) => p.id === id)[0];
        if (pickupLocation) {
            this.setState({
                showOption: true,
                pickupLocation,
                zones: zones.map(onMap),
            });
        }
    };

    onOptionClose = () => {
        this.setState({ showOption: false, pickupLocation: null });
    };

    onUpdateLocation = (location) => {
        const { zones } = this.state;

        this.setState({
            zones: [],
        });

        setTimeout(() => {
            this.setState({
                showOption: false,
                pickupLocation: null,
                zones: zones.map((p) => {
                    if (location.id === p.id) {
                        return location;
                    }
                    return p;
                }),
            });
        }, 1000);
    };

    render() {
        const {
            langName,
            showOption,
            mapId,
            center,
            pickupLocation,
            loadingAddLocation,
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
                                        zones={[]}
                                        id={mapId}
                                        styles={styles}
                                    />
                                    <Options
                                        onUpdate={this.onUpdateLocation}
                                        onClose={this.onOptionClose}
                                        display={showOption}
                                        zone={null}
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

function Options({ display, location, onClose, onUpdate }) {
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
