import React, {
    Component,
    useState,
    useRef,
    useMemo,
    useCallback,
    useEffect,
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
                    this.setState({ center: [8.975595, -79.53601] });
                }
            );
        }
    };

    render() {
        const { center } = this.state;
        const {
            styles,
            pickupLocations,
            onMarkerDrag,
            onDeleteClick,
            onLoad,
            mode,
            pickupLocation,
            onEdit,
        } = this.props;
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
                    {pickupLocations.map((location) => {
                        return (
                            <DraggableMarker
                                key={location.id}
                                onDrag={onMarkerDrag}
                                onEdit={onEdit}
                                mode={mode}
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

function DraggableMarker({ location, onDrag, onDelete, onEdit, mode }) {
    const { id, latitude, longitude, name } = location;
    const center = {
        lat: latitude,
        lng: longitude,
    };

    const map = useMap();
    const [loading, setLoading] = useState(false);
    const [draggable, setDraggable] = useState(mode === 'edit');
    const [position, setPosition] = useState(center);
    const markerRef = useRef(null);
    useEffect(() => {
        setDraggable(mode === 'edit');
    }, [mode]);
    const eventHandlers = useMemo(
        () => ({
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
            <Popup minWidth={20}>
                <b>{name}</b>
                <br />
                <br />
                <div>
                    <Button
                        size="small"
                        auto
                        type="secondary"
                        style={{
                            marginRight: 20,
                        }}
                        onClick={() => {
                            onEdit(location);
                        }}
                    >
                        Edit
                    </Button>

                    {loading ? (
                        <Button size="small" auto loading disabled type="error">
                            Delete
                        </Button>
                    ) : (
                        <Button
                            onClick={() => {
                                if (
                                    confirm(
                                        `Are you sure you want to delete "${name}"`
                                    )
                                ) {
                                    setLoading(true);
                                    onDelete(id, markerRef, map);
                                }
                            }}
                            size="small"
                            auto
                            type="error"
                        >
                            Delete
                        </Button>
                    )}
                </div>
            </Popup>
        </Marker>
    );
}
