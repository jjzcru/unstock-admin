import React, { Component, useState } from 'react';
import {
    MapContainer,
    TileLayer,
    useMapEvent,
    Popup,
    Polygon,
} from 'react-leaflet';

import { Button } from '@geist-ui/react';

import { AppContext } from './AppContext';

export default class Map extends Component {
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
                this.setState({ zones });
            }
        }
    }

    render() {
        const { zone, zones } = this.state;
        const { center, styles, onLoad, onEdit, zoom, onDelete } = this.props;
        if (!center.length) {
            return null;
        }

        return (
            <div className={styles.map}>
                <MapContainer
                    center={center}
                    zoom={zoom}
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
                                      onDelete={onDelete}
                                      onEdit={onEdit}
                                      key={z.id}
                                      zone={z}
                                  />
                              );
                          })
                        : null}
                    {zone ? (
                        <ZonePolygon
                            onDelete={onDelete}
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

function ZonePolygon({ zone, onEdit, onAdd, onDelete }) {
    const { id, name, path } = zone;
    const [loading, setLoading] = useState(false);
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
            <Popup minWidth={100}>
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
                            onEdit(id);
                        }}
                    >
                        Edit
                    </Button>
                    {loading ? (
                        <Button size="small" auto disabled loading type="error">
                            Delete
                        </Button>
                    ) : (
                        <Button
                            size="small"
                            auto
                            type="error"
                            onClick={async () => {
                                if (
                                    confirm(
                                        `Are you sure you want to delete: "${name}"`
                                    )
                                ) {
                                    setLoading(true);
                                    await onDelete(zone);
                                    setLoading(false);
                                }
                            }}
                        >
                            Delete
                        </Button>
                    )}
                </div>
            </Popup>
        </Polygon>
    );
}
