"use client";

import L from "leaflet";
import { useEffect, useState } from "react";

import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import type { MarkerIcon } from "../Data/mapIcons";
import { getMapIcons } from "../Data/mapIcons";


type MapPickerReadOnlyProps = {
  initialLat?: number;
  initialLng?: number;
};

// ✅ This helper keeps the map centered when position changes
function MapUpdater({ position }: { position: L.LatLng | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
      // Disable all interactions for read-only
      map.dragging.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.scrollWheelZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
      if ((map as L.Map & { tap?: { disable: () => void } }).tap) {
        (map as L.Map & { tap?: { disable: () => void } }).tap!.disable();
      }
    }
  }, [position, map]);
  return null;
}

export default function MapPickerReadOnly({
  initialLat = 42.78,
  initialLng = -83.77,
}: MapPickerReadOnlyProps) {
  const [position, setPosition] = useState<L.LatLng | null>(
    initialLat && initialLng ? new L.LatLng(initialLat, initialLng) : null
  );const [icons, setIcons] = useState<{
    themedHoneyIcon: MarkerIcon;
    themedTrapIcon: MarkerIcon;
  } | null>(null);
  
  useEffect(() => {
    let mounted = true;
  
    (async () => {
      const { themedHoneyIcon, themedTrapIcon } = await getMapIcons();
      if (mounted) setIcons({ themedHoneyIcon, themedTrapIcon });
    })();
  
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (initialLat && initialLng) {
      setPosition(new L.LatLng(initialLat, initialLng));
    }
  }, [initialLat, initialLng]);

  if (!position) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">No location set</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <MapContainer
        center={[position.lat, position.lng]}
        zoom={16}
        style={{ height: "400px", width: "100%", cursor: "default" }}
        dragging={false}
        touchZoom={false}
        doubleClickZoom={false}
        scrollWheelZoom={false}
        boxZoom={false}
        keyboard={false}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
        <MapUpdater position={position} />
        <Marker position={position} icon={icons?.themedHoneyIcon}>
          <Popup>
            Lat: {position.lat.toFixed(4)}, Lng: {position.lng.toFixed(4)}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
