"use client"
import { MapContainer,TileLayer,Marker,Popup,useMapEvents } from "react-leaflet";
import { useState } from "react";
import L from "leaflet";
import { Notes } from "@/utils/types";
import "leaflet/dist/leaflet.css";
const DefaultIcon = L.icon({
    iconUrl: '/defaultIcon.png',
    iconSize: [25, 25],
    iconAnchor: [12, 30],
    popupAnchor: [1, -34],
});
const ClickableMarker = ({addMarker} : {addMarker: (lat: number, lon: number,message: string) => void}) => {
    const [position, setPosition] = useState<[number, number] | null>(null);
    const [message, setMessage] = useState<string>("");
    const handleAddMarker =async() => {
        if (position) {
            await addMarker(position[0], position[1], message);
            setMessage("");
            setPosition(null);
        }
    };
    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });
    return position === null ? null : (
        <Marker position={position} icon={DefaultIcon}>
            <Popup>
                <div className="flex flex-col items-center p-2 min-width-[200px]">
                    <h2 className="font-bold text-darkBrown">Add a Note</h2>
                    <input
                        type="text"
                        placeholder="Note"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="border border-darkBrown rounded p-1 my-2 w-full"
                    />
                    <button className="bg-darkBrown text-white rounded px-4 py-2" onClick={handleAddMarker}>Add Marker</button>
                </div>
            </Popup>
        </Marker>
    );
}
export default function Map({ markers, addMarker }: { markers: Notes[]; addMarker: (lat: number, lon: number, message: string) => void }) {
    return (
        <MapContainer center={[51.505, -0.09]} zoom={13} className="h-full w-full">
        <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {markers.map((marker) => (
            <Marker key={marker.id} position={[marker.lat, marker.lon]} icon={DefaultIcon}>
                <Popup>
                    Note: {marker.message}
                </Popup>
            </Marker>
        ))}
        <ClickableMarker addMarker={addMarker} />
        </MapContainer>
    );
}