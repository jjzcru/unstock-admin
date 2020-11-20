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
    Popup,
    useMapEvents,
    Polygon,
} from 'react-leaflet';

import { AppContext } from './AppContext';

export default class Map extends React.Component {
    mapRef = React.createRef();

    static contextType = AppContext;

    state = {
        center: [],
        markers: [],
    };
    componentDidMount() {
        const { pickupLocations, onMarkerClick, onMarkerDrag } = this.props;
        this.onStartCenterMap();
        const markers = [];

        for (const pickupLocation of pickupLocations) {
            markers.push(
                <DraggableMarker
                    key={pickupLocation.id}
                    onClick={onMarkerClick}
                    onDrag={onMarkerDrag}
                    location={pickupLocation}
                />
            );
        }

        this.setState({ markers });
    }

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
        const { center, markers } = this.state;
        const { styles, id } = this.props;
        if (!center.length) {
            return null;
        }
        return (
            <div className={styles.map}>
                <MapContainer
                    center={center}
                    zoom={20}
                    onClick={this.onClick}
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
                    {markers}
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
                <b>Name:</b>
                <br />
                {name}
                <br />
                <b>Additional Details:</b>
                <br />
                {additionalDetails}
            </Popup>
        </Marker>
    );
}

function DraggableMarker({ onClick, location, onDrag }) {
    const { id, latitude, longitude, name, additionalDetails } = location;
    const center = {
        lat: latitude,
        lng: longitude,
    };
    const [draggable, setDraggable] = useState(true);
    const [position, setPosition] = useState(center);
    const markerRef = useRef(null);
    const eventHandlers = useMemo(
        () => ({
            click() {
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
            <Popup minWidth={90}>
                <b>Name:</b>
                <br />
                {name}
                <br />
                <b>Additional Details:</b>
                <br />
                {additionalDetails}
            </Popup>
        </Marker>
    );
}
