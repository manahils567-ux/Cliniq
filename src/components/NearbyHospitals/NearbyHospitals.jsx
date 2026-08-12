import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { Button, List, Tag, Spin, Alert, Select, Typography, Card, Badge } from 'antd';
import { EnvironmentOutlined, PhoneOutlined, MedicineBoxOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getFromLocalStorage } from '../../utils/local-storage';
import { authKey } from '../../constant/storageKey';

// Fix leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const { Title, Text } = Typography;
const { Option } = Select;

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5050/api/v1';

const TYPE_COLORS = {
    hospital: 'red',
    clinic: 'blue',
    pharmacy: 'green',
    doctors: 'purple',
};

const TYPE_ICONS = {
    hospital: '🏥',
    clinic: '🏨',
    pharmacy: '💊',
    doctors: '👨‍⚕️',
};

// Create custom coloured markers
const createIcon = (type) => {
    const colors = { hospital: '#ef4444', clinic: '#3b82f6', pharmacy: 'var(--c-positive)', doctors: '#a855f7' };
    const color = colors[type] || '#6b7280';
    return L.divIcon({
        className: '',
        html: `<div style="
            background:${color};
            width:28px;height:28px;border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);border:3px solid white;
            box-shadow:0 2px 6px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -30],
    });
};

const userIcon = L.divIcon({
    className: '',
    html: `<div style="
        background:#0ea5e9;width:16px;height:16px;
        border-radius:50%;border:3px solid white;
        box-shadow:0 0 0 4px rgba(14,165,233,0.3);
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
});

// Fly map to user location
const FlyTo = ({ position }) => {
    const map = useMap();
    useEffect(() => { if (position) map.flyTo(position, 14); }, [position, map]);
    return null;
};

const NearbyHospitals = () => {
    const [location, setLocation] = useState(null);
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(false);
    const [locError, setLocError] = useState(null);
    const [radius, setRadius] = useState(3000);
    const [selected, setSelected] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);

    const token = getFromLocalStorage(authKey);

    const fetchNearby = async (lat, lng, r = radius) => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/nearby`, {
                params: { lat, lng, radius: r },
                headers: { Authorization: token },
            });
            setPlaces(res.data?.data || []);
            setHasSearched(true);
        } catch {
            setLocError('Failed to fetch nearby facilities. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleFind = () => {
        setLocError(null);
        if (!navigator.geolocation) {
            setLocError('Geolocation is not supported by your browser.');
            return;
        }
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setLocation([latitude, longitude]);
                fetchNearby(latitude, longitude);
            },
            () => {
                setLoading(false);
                setLocError('Location access denied. Please allow location access and try again.');
            }
        );
    };

    const handleRadiusChange = (val) => {
        setRadius(val);
        if (location) fetchNearby(location[0], location[1], val);
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <Title level={5} style={{ margin: 0 }}>
                    <EnvironmentOutlined className="me-2" />
                    Nearby Healthcare
                </Title>
                <div className="d-flex align-items-center gap-2">
                    <Select value={radius} onChange={handleRadiusChange} style={{ width: 130 }} disabled={loading}>
                        <Option value={1000}>Within 1 km</Option>
                        <Option value={3000}>Within 3 km</Option>
                        <Option value={5000}>Within 5 km</Option>
                        <Option value={10000}>Within 10 km</Option>
                    </Select>
                    <Button
                        type="primary"
                        icon={hasSearched ? <ReloadOutlined /> : <EnvironmentOutlined />}
                        onClick={handleFind}
                        loading={loading}
                    >
                        {hasSearched ? 'Refresh' : 'Find Near Me'}
                    </Button>
                </div>
            </div>

            {locError && (
                <Alert type="error" message={locError} className="mb-3" closable onClose={() => setLocError(null)} />
            )}

            {/* Map */}
            <div style={{ height: 380, borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
                <MapContainer
                    center={location || [30.3753, 69.3451]}
                    zoom={location ? 14 : 5}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    />
                    {location && (
                        <>
                            <FlyTo position={location} />
                            <Marker position={location} icon={userIcon}>
                                <Popup><strong>Your location</strong></Popup>
                            </Marker>
                            <Circle
                                center={location}
                                radius={radius}
                                pathOptions={{ color: '#0ea5e9', fillColor: '#0ea5e9', fillOpacity: 0.08 }}
                            />
                        </>
                    )}
                    {places.map((place) => (
                        <Marker
                            key={place.id}
                            position={[place.lat, place.lng]}
                            icon={createIcon(place.type)}
                            eventHandlers={{ click: () => setSelected(place) }}
                        >
                            <Popup>
                                <strong>{TYPE_ICONS[place.type] || '📍'} {place.name}</strong>
                                <br />
                                <span style={{ color: '#6b7280', fontSize: 12 }}>{place.address}</span>
                                {place.phone && <><br /><span>📞 {place.phone}</span></>}
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            {/* Legend */}
            <div className="d-flex gap-2 flex-wrap mb-3">
                {Object.entries(TYPE_COLORS).map(([type, color]) => (
                    <Tag key={type} color={color}>{TYPE_ICONS[type]} {type.charAt(0).toUpperCase() + type.slice(1)}</Tag>
                ))}
            </div>

            {/* List */}
            {loading && !hasSearched ? (
                <div className="text-center py-4"><Spin /></div>
            ) : hasSearched ? (
                <>
                    <Text type="secondary" className="d-block mb-2">
                        {places.length} facilities found within {radius / 1000} km
                    </Text>
                    <List
                        dataSource={places}
                        renderItem={(place) => (
                            <List.Item
                                key={place.id}
                                style={{
                                    cursor: 'pointer',
                                    background: selected?.id === place.id ? 'var(--n-050)' : 'transparent',
                                    borderRadius: 8,
                                    padding: '8px 12px',
                                }}
                                onClick={() => setSelected(place)}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <span style={{ fontSize: 24 }}>{TYPE_ICONS[place.type] || '📍'}</span>
                                    }
                                    title={
                                        <div className="d-flex align-items-center gap-2">
                                            <Text strong>{place.name}</Text>
                                            <Tag color={TYPE_COLORS[place.type] || 'default'} style={{ margin: 0 }}>
                                                {place.type}
                                            </Tag>
                                        </div>
                                    }
                                    description={
                                        <div>
                                            <EnvironmentOutlined style={{ fontSize: 11, marginRight: 4 }} />
                                            <Text type="secondary" style={{ fontSize: 12 }}>{place.address}</Text>
                                            {place.phone && (
                                                <div>
                                                    <PhoneOutlined style={{ fontSize: 11, marginRight: 4 }} />
                                                    <Text style={{ fontSize: 12 }}>{place.phone}</Text>
                                                </div>
                                            )}
                                        </div>
                                    }
                                />
                            </List.Item>
                        )}
                        locale={{ emptyText: 'No healthcare facilities found in this area.' }}
                    />
                </>
            ) : (
                <div className="text-center py-5" style={{ color: '#94a3b8' }}>
                    <MedicineBoxOutlined style={{ fontSize: 48, marginBottom: 12, display: 'block' }} />
                    <Text type="secondary">Click "Find Near Me" to discover hospitals, clinics, and pharmacies near you.</Text>
                </div>
            )}
        </div>
    );
};

export default NearbyHospitals;
