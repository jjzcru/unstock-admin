import React, { useContext } from 'react';
import dynamic from 'next/dynamic';
import * as Icon from '@geist-ui/react-icons';
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
    };

    componentDidMount() {
        this.setState({ pickupLocations: this.props.pickupLocations });
    }

    onToggleShowOption = () => {
        const { showOption } = this.state;
        this.setState({ showOption: !showOption, mapId: Math.random() });
    };

    onMarkerClick = (id) => {
        const { pickupLocations } = this.state;
        const pickupLocation = pickupLocations.filter((p) => p.id === id)[0];
        if (pickupLocation) {
            const { showOption } = this.state;
            this.setState({
                showOption: !showOption,
                mapId: Math.random(),
                pickupLocation,
            });
        }
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

    render() {
        const {
            langName,
            showOption,
            mapId,
            pickupLocation,
            pickupLocations,
        } = this.state;
        const selectedLang = this.props.lang[langName];
        //
        return (
            <div className="container">
                <AppContext.Provider
                    value={{
                        locale: selectedLang,
                    }}
                >
                    <Navbar lang={selectedLang} />
                    <div>
                        <Sidebar lang={selectedLang} />
                        <main className={styles.main}>
                            <Topbar onAdd={this.onToggleShowOption} />
                            <div className={styles['map-options-container']}>
                                <div
                                    style={{
                                        width: showOption ? '75%' : '100%',
                                    }}
                                >
                                    <Map
                                        onMarkerDrag={this.onUpdatePosition}
                                        onMarkerClick={this.onMarkerClick}
                                        pickupLocations={pickupLocations}
                                        id={mapId}
                                        styles={styles}
                                    />
                                </div>
                                <div
                                    style={{
                                        width: showOption ? '25%' : '0%',
                                    }}
                                >
                                    <Options
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

function Topbar({ onAdd }) {
    const { locale } = useContext(AppContext);
    return (
        <div className={styles['top-bar']}>
            <div className={styles.title}>
                <h2>{locale.PICKUP_LOCATION_TITLE}</h2>
            </div>
            <button onClick={onAdd}>Add pickup location</button>
        </div>
    );
}

function Options({ display, location }) {
    if (!location) {
        return null;
    }
    if (!display) {
        return null;
    }
    const { id, latitude, longitude, name, additionalDetails } = location;

    return (
        <div className={styles['pickup-location-options']}>
            <div>
                <div>
                    <Icon.XCircle />
                </div>
                <div>
                    Name: <br />
                    <input type="text" value={name} />
                </div>
                <div>
                    Latitude: <br />
                    <input type="number" value={latitude} />
                </div>
                <div>
                    Longitude: <br />
                    <input type="number" value={longitude} />
                </div>
            </div>
        </div>
    );
}
