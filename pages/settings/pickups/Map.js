import React, {
    Component,
    useState,
    useRef,
    useMemo,
    useCallback,
} from 'react';
import {
    MapContainer,
    TileLayer,
    Marker,
    useMap,
    Popup,
    useMapEvents,
    Polygon,
} from 'react-leaflet';

import { Button } from '@geist-ui/react';

import { AppContext } from './AppContext';

export default class Map extends React.Component {
    mapRef = React.createRef();

    static contextType = AppContext;

    state = {
        center: [],
        markers: null,
        map: null,
        error: null,
    };
    componentDidMount() {
        this.onStartCenterMap();
    }

    onDelete = async (id, markerRef, map) => {
        const { onDeleteClick } = this.props;

        await onDeleteClick(id);
        if (map) {
            try {
                map.removeLayer(markerRef.current);
            } catch (_) {
                this.setState({ error: null });
            }
        }
    };

    onStartCenterMap = () => {
        const { pickupLocations } = this.props;
        const { locale } = this.context;

        if (pickupLocations.length) {
            const { latitude, longitude } = pickupLocations[0];
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
    };
    onClick = (e) => {
        const newPos = [e.latlng.lat, e.latlng.lng];
    };

    render() {
        const { center } = this.state;
        const {
            styles,
            pickupLocations,
            onMarkerClick,
            onMarkerDrag,
            onDeleteClick,
        } = this.props;
        if (!center.length) {
            return null;
        }
        return (
            <div className={styles.map}>
                <MapContainer
                    center={center}
                    zoom={15}
                    onClick={this.onClick}
                    whenCreated={(map) => {
                        this.setState({ map });
                    }}
                    style={{
                        width: '100%',
                        height: '100%',
                    }}
                    scrollWheelZoom={true}
                >
                    <TileLayer
                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {pickupLocations.map((location) => {
                        return (
                            <DraggableMarker
                                key={location.id}
                                onClick={onMarkerClick}
                                onDrag={onMarkerDrag}
                                onDelete={this.onDelete}
                                location={location}
                            />
                        );
                    })}
                </MapContainer>
            </div>
        );
    }
}

function LocationMarker({ onClick, location }) {
    const { id, latitude, longitude, name, additionalDetails } = location;
    const [position, setPosition] = useState(null);
    const map = useMapEvents({
        click() {
            onClick(id);
        },
    });

    return (
        <Marker position={[latitude, longitude]}>
            <Popup>
                <b>{name}</b>
            </Popup>
        </Marker>
    );
}

function DraggableMarker({ onClick, location, onDrag, onDelete }) {
    const { id, latitude, longitude, name, additionalDetails } = location;
    const center = {
        lat: latitude,
        lng: longitude,
    };

    const map = useMap();
    const [loading, setLoading] = useState(false);
    const [draggable, setDraggable] = useState(true);
    const [position, setPosition] = useState(center);
    const markerRef = useRef(null);
    const eventHandlers = useMemo(
        () => ({
            click() {
                setDraggable(true);
                onClick(id);
            },
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    const { lat, lng } = marker.getLatLng();
                    setPosition(marker.getLatLng());
                    onDrag(id, lat, lng);
                }
            },
        }),
        []
    );

    return (
        <Marker
            draggable={draggable}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
        >
            <Popup
                minWidth={20}
                onClose={() => {
                    setDraggable(false);
                }}
            >
                <b>{name}</b>
                <br />
                <br />
                {loading ? (
                    <Button size="small" auto loading disabled type="error">
                        Delete
                    </Button>
                ) : (
                    <Button
                        onClick={() => {
                            setLoading(true);
                            onDelete(id, markerRef, map);
                        }}
                        size="small"
                        auto
                        type="error"
                    >
                        Delete
                    </Button>
                )}
            </Popup>
        </Marker>
    );
}
