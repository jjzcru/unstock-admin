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
import styles from './Pickups.module.css';

const Map = dynamic(() => import('./Map'), { ssr: false });

import { Sidebar } from '@components/Sidebar';
import { Navbar } from '@components/Navbar';
import { GetPickupLocations } from '@domain/interactors/ShippingUseCases';

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

    const useCase = new GetPickupLocations(storeId);
    const pickupLocations = await useCase.execute();

    return {
        props: {
            lang,
            storeId,
            pickupLocations: JSON.parse(
                JSON.stringify(pickupLocations, replacer)
            ),
        }, // will be passed to the page component as props
    };
}

export default class Pickups extends React.Component {
    state = {
        langName: 'es',
        showOption: false,
        mapId: Math.random(),
        pickupLocation: null,
        pickupLocations: [],
        loadingAddLocation: false,
        center: [],
    };

    componentDidMount() {
        const { pickupLocations } = this.props;
        this.setState({ pickupLocations });
    }

    onToggleShowOption = () => {
        const { showOption } = this.state;
        this.setState({ showOption: !showOption, mapId: Math.random() });
    };

    onMarkerClick = (id) => {
        const { pickupLocations, showOption } = this.state;
        const pickupLocation = pickupLocations.filter((p) => p.id === id)[0];
        if (pickupLocation) {
            this.setState({
                pickupLocation: null,
                showOption: !showOption,
                mapId: Math.random(),
            });

            setTimeout(() => {
                this.setState({ pickupLocation });
            }, 100);
        }
    };

    onRemoveLocation = async (id) => {
        const { storeId } = this.props;
        const { pickupLocations } = this.state;
        const pickupLocation = pickupLocations.filter((p) => p.id === id)[0];
        if (pickupLocation) {
            try {
                await fetch(`/api/pickups/${id}`, {
                    method: 'delete',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-unstock-store': storeId,
                    },
                });
                this.setState({
                    pickupLocation: null,
                    showOption: false,
                    pickupLocations: pickupLocations.filter((p) => p.id !== id),
                });
            } catch (e) {
                alert(e.message);
            }
        }
    };

    onClickAddLocation = async () => {
        const { storeId } = this.props;
        this.setState({ loadingAddLocation: true });
        try {
            const { latitude, longitude } = await this.getCurrentPosition();
            const res = await fetch(`/api/pickups`, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                    'x-unstock-store': storeId,
                },
                body: JSON.stringify({
                    name: '-',
                    additionalDetails: '',
                    latitude,
                    longitude,
                    isEnabled: true,
                }),
            });
            const location = await res.json();
            this.onAddLocation(location);
        } catch (e) {
            this.setState({ loadingAddLocation: false });
            alert(e.message);
        }
    };

    getCurrentPosition = () => {
        const { pickupLocations } = this.state;
        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { coords } = position;
                    const { latitude, longitude } = coords;
                    resolve({ latitude, longitude });
                },
                () => {
                    if (pickupLocations.length) {
                        const location = pickupLocations[0];
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
        const { pickupLocations } = this.state;
        const { latitude, longitude } = location;
        pickupLocations.push(location);
        this.setState({
            loadingAddLocation: false,
            pickupLocations,
            mapId: Math.random(),
            center: [latitude, longitude],
        });
    };

    onUpdatePosition = (id, latitude, longitude) => {
        const { pickupLocations } = this.state;
        const onMap = (p) => {
            if (id === p.id) {
                p.latitude = latitude;
                p.longitude = longitude;
            }
            return p;
        };

        const pickupLocation = pickupLocations
            .map(onMap)
            .filter((p) => p.id === id)[0];
        if (pickupLocation) {
            this.setState({
                showOption: true,
                pickupLocation,
                pickupLocations: pickupLocations.map(onMap),
            });
        }
    };

    onOptionClose = () => {
        this.setState({ showOption: false, pickupLocation: null });
    };

    onUpdateLocation = (location) => {
        const { pickupLocations } = this.state;

        this.setState({
            pickupLocations: [],
        });

        setTimeout(() => {
            this.setState({
                showOption: false,
                pickupLocation: null,
                pickupLocations: pickupLocations.map((p) => {
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
            pickupLocations,
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
                                locations={pickupLocations}
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
                                        onMarkerDrag={this.onUpdatePosition}
                                        onMarkerClick={this.onMarkerClick}
                                        onDeleteClick={this.onRemoveLocation}
                                        pickupLocations={pickupLocations}
                                        id={mapId}
                                        styles={styles}
                                    />
                                    <Options
                                        onUpdate={this.onUpdateLocation}
                                        onClose={this.onOptionClose}
                                        display={showOption}
                                        location={pickupLocation}
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

function Topbar({ onAdd, locations, loading }) {
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
            ) : locations.length < 5 ? (
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
