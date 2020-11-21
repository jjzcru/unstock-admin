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
    useMapEvent,
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
        zone: null,
        zones: [],
    };

    componentDidMount() {
        const { zones } = this.props;
        this.setState({ zones });
    }

    onAddPoint = (e) => {
        const { setEditedZone } = this.props;
        const { zone } = this.state;
        console.log(`ZONE on add point`);
        console.log(zone);
        if (zone) {
            const position = [e.latlng.lat, e.latlng.lng];
            const path = [...zone.path];
            path.push(position);
            zone.path = path;
            setEditedZone(zone);
            this.setState({
                zone,
            });
        }
    };

    componentDidUpdate(prevProps) {
        const { zone, setEditedZone, zones } = this.props;
        if (prevProps.zone === null && zone) {
            setEditedZone(zone);
            this.setState({ zone });
        }

        if (prevProps.zone && zone === null) {
            setEditedZone(null);
            this.setState({ zone: null });
        }

        if (prevProps.zones && zones) {
            if (prevProps.zones.length !== zones.length) {
                console.clear();
                console.log(`The amount of zones change`);
                console.log(`Zone`);
                console.log(zone);
                console.log(`ZONES:`);
                console.log(zones);
                this.setState({ zones });
            }
        }
    }

    render() {
        const { zone, zones } = this.state;
        const { center, styles, onLoad, onEdit } = this.props;
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
                    {zone === null
                        ? zones.map((z) => {
                              return (
                                  <ZonePolygon
                                      onEdit={onEdit}
                                      key={z.id}
                                      zone={z}
                                  />
                              );
                          })
                        : null}
                    {zone ? (
                        <ZonePolygon
                            onAdd={this.onAddPoint}
                            onEdit={onEdit}
                            key={zone.id}
                            zone={zone}
                        />
                    ) : null}
                </MapContainer>
            </div>
        );
    }
}

function ZonePolygon({ zone, onEdit, onAdd }) {
    const { id, name, path } = zone;
    useMapEvent('click', (e) => {
        if (onAdd) {
            onAdd(e);
        }
    });
    return (
        <Polygon
            pathOptions={{ color: 'green', fillColor: 'green' }}
            positions={path}
        >
            <Popup>
                <b>{name}</b>
                <br />
                <br />
                <Button
                    size="small"
                    auto
                    type="secondary"
                    onClick={() => {
                        onEdit(id);
                    }}
                >
                    Edit
                </Button>
            </Popup>
        </Polygon>
    );
}
