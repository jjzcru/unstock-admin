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
        map: null,
        error: null,
    };
    componentDidMount() {
        this.onStartCenterMap();
    }

    onStartCenterMap = () => {
        const { zones } = this.props;
        const { locale } = this.context;

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

        /*if (zones.length) {
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
        }*/
    };
    onClick = (e) => {
        const newPos = [e.latlng.lat, e.latlng.lng];
    };

    render() {
        const { center } = this.state;
        const { styles, zones, onLoad } = this.props;
        if (!center.length) {
            return null;
        }
        return (
            <div className={styles.map}>
                <MapContainer
                    center={center}
                    zoom={15}
                    whenCreated={(map) => {
                        onLoad(map);
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
                </MapContainer>
            </div>
        );
    }
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
