import React, { useContext } from 'react';

import dynamic from 'next/dynamic';

import { Button } from '@geist-ui/react';
import styles from './Pickups.module.css';

const Map = dynamic(
    () => {
        return import('@components/pickups/Map.js');
    },
    { ssr: false }
);

import Options from './Options';

import { Sidebar } from '@components/Sidebar';
import { Navbar } from '@components/Navbar';
import { GetPickupLocations } from '@domain/interactors/ShippingUseCases';

import { AppContext } from '@components/pickups/AppContext';

import ShippingOptionsModal from './ShippingOptionsModal';

import { getSessionData } from '@utils/session';

import lang from '@lang';
import { getSession } from 'next-auth/client';

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

    const { storeId } = getSessionData(session);

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
        filteredPickupLocations: [],
        editedLocation: null,
        loadingAddLocation: false,
        center: [],
        mode: null,
        showModal: false,
        map: null,
    };

    componentDidMount() {
        const { pickupLocations } = this.props;
        this.setState({
            pickupLocations,
            filteredPickupLocations: pickupLocations,
        });
    }

    onEditClick = (location) => {
        const { pickupLocations } = this.state;
        const { latitude, longitude } = location;
        this.centerMap(latitude, longitude, 20);
        this.setState({
            editedLocation: location,
            filteredPickupLocations: pickupLocations.filter(
                (p) => p.id === location.id
            ),
            mode: 'edit',
            showOption: true,
            center: [latitude, longitude],
        });
    };

    centerMap = (latitude, longitude, zoom) => {
        const { map } = this.state;
        map.setView({ lat: latitude, lng: longitude }, zoom);
    };

    getCenterPosition = () => {
        const { map } = this.state;
        if (map) {
            const { lat, lng } = map.getBounds().getCenter();
            return {
                latitude: lat,
                longitude: lng,
            };
        }

        return null;
    };

    onMapLoad = (map) => {
        this.setState({ map });
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
                const locations = pickupLocations.filter((p) => p.id !== id);
                this.setState({
                    editedLocation: null,
                    pickupLocation: null,
                    showOption: false,
                    pickupLocations: locations,
                    filteredPickupLocations: locations,
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
            const { latitude, longitude } = await this.getCenterPosition();
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
            filteredPickupLocations: pickupLocations,
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
        const { pickupLocations } = this.state;
        this.setState({
            showOption: false,
            pickupLocation: null,
            mode: null,
            filteredPickupLocations: pickupLocations,
            editedLocation: null,
        });
    };

    onOpenModal = ({ location, callback, paymentMethods }) => {
        this.setState({
            editedLocation: location,
            showModal: true,
            onSaveModalCallback: callback,
            paymentMethods,
        });
    };

    onUpdateLocation = (location) => {
        const { pickupLocations } = this.state;

        let locations = [...pickupLocations];
        locations = locations.map((l) => {
            if (l.id === location.id) {
                return location;
            }

            return l;
        });

        this.setState({
            pickupLocations: locations,
            filteredPickupLocations: locations,
            showOption: false,
            pickupLocation: null,
            editedLocation: null,
            mode: null,
        });
    };

    onCloseModal = () => {
        this.setState({
            showModal: false,
        });
    };

    render() {
        const {
            langName,
            showOption,
            mapId,
            mode,
            center,
            map,
            showModal,
            editedLocation,
            loadingAddLocation,
            shippingOption,
            onSaveModalCallback,
            pickupLocations,
            filteredPickupLocations,
            paymentMethods,
        } = this.state;
        const selectedLang = this.props.lang[langName];

        return (
            <div className="container">
                <AppContext.Provider
                    value={{
                        mode,
                        map: map,
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
                                        onEdit={this.onEditClick}
                                        mode={mode}
                                        onMarkerDrag={this.onUpdatePosition}
                                        onDeleteClick={this.onRemoveLocation}
                                        pickupLocations={
                                            filteredPickupLocations
                                        }
                                        id={mapId}
                                        onLoad={this.onMapLoad}
                                        styles={styles}
                                    />
                                    <Options
                                        onOpenModal={this.onOpenModal}
                                        onUpdate={this.onUpdateLocation}
                                        onClose={this.onOptionClose}
                                        display={showOption}
                                        location={editedLocation}
                                    />
                                    <ShippingOptionsModal
                                        location={editedLocation}
                                        show={showModal}
                                        onClose={this.onCloseModal}
                                        callback={onSaveModalCallback}
                                        shippingOption={shippingOption}
                                        paymentMethods={paymentMethods}
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
    const { locale, map, mode } = useContext(AppContext);
    return (
        <div className={styles['top-bar']}>
            <div className={styles.title}>
                <h2>{locale.PICKUP_LOCATION_TITLE}</h2>
            </div>
            {loading ? (
                <Button auto size="medium" loading disabled type="secondary">
                    Add
                </Button>
            ) : locations.length < 5 && map && mode === null ? (
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
