import React, { Component, useState, useRef, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';

import { Button } from '@geist-ui/react';
import { AppContext } from './AppContext';

export default class Map extends Component {
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

    onStartCenterMap = () => {
        const { location } = this.props;
        if (location.length) {
            const { latitude, longitude } = location[0];
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
        const { onLoad, location } = this.props;
        let marker = null;
        if (location.length) {
            marker = [location[0].latitude, location[0].longitude];
        }
        if (!center.length) {
            return null;
        }
        return (
            <div>
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
                    <Marker draggable={false} position={marker}></Marker>
                </MapContainer>
            </div>
        );
    }
}
