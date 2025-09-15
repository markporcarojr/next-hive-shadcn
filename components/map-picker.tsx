// components/MapPicker.tsx
"use client";

import { Box, Button, Group, rem, Stack, Text, TextInput } from "@mantine/core";
import { IconSearch, IconTarget } from "@tabler/icons-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import { honeyIcon } from "../data/mapIcons";

type MapPickerProps = {
  initialLat?: number;
  initialLng?: number;
  onSelect: (lat: number, lng: number) => void;
};

function LocationMarker({
  onSelect,
  selectedPosition,
}: {
  onSelect: (lat: number, lng: number) => void;
  selectedPosition: L.LatLng | null;
}) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  if (!selectedPosition) return null;

  return (
    <Marker position={selectedPosition} icon={honeyIcon}>
      <Popup>
        <Text fw={500}>Selected Location</Text>
        <Text size="sm">
          Lat: {selectedPosition.lat.toFixed(4)}, Lng:{" "}
          {selectedPosition.lng.toFixed(4)}
        </Text>
      </Popup>
    </Marker>
  );
}

export default function MapPicker({
  initialLat = 42.78,
  initialLng = -83.77,
  onSelect,
}: MapPickerProps) {
  const [position, setPosition] = useState<L.LatLng | null>(
    new L.LatLng(initialLat, initialLng)
  );
  const [searchQuery, setSearchQuery] = useState("");
  const mapRef = useRef<L.Map>(null);

  const handleGeocode = async () => {
    if (!searchQuery) return;

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      searchQuery
    )}&format=json&limit=1`;

    const res = await fetch(url);
    const data = await res.json();

    if (data && data[0]) {
      const { lat, lon } = data[0];
      const newPos = new L.LatLng(parseFloat(lat), parseFloat(lon));
      setPosition(newPos);
      onSelect(newPos.lat, newPos.lng);
      mapRef.current?.setView(newPos, 15);
    } else {
      alert("Location not found");
    }
  };

  const handleUseCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = pos.coords;
        const newPos = new L.LatLng(coords.latitude, coords.longitude);
        setPosition(newPos);
        onSelect(newPos.lat, newPos.lng);
        mapRef.current?.setView(newPos, 15);
      },
      () => {
        alert("Could not access location");
      }
    );
  };

  return (
    <Stack gap="xs">
      <Group grow>
        <TextInput
          placeholder="Search for address"
          leftSection={<IconSearch size={rem(16)} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
        />
        <Button onClick={handleGeocode}>Search</Button>
        <Button
          variant="light"
          leftSection={<IconTarget size={16} />}
          onClick={handleUseCurrentLocation}
        >
          Use Current Location
        </Button>
      </Group>

      <Box
        style={{
          border: "2px solid #f4b400",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 0 10px rgba(244, 180, 0, 0.5)",
        }}
      >
        <MapContainer
          center={[initialLat, initialLng]}
          zoom={13}
          style={{ height: "400px", width: "100%" }}
          ref={(ref) => {
            if (ref && !mapRef.current) {
              mapRef.current = ref;
            }
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />
          <LocationMarker onSelect={onSelect} selectedPosition={position} />
        </MapContainer>
      </Box>
    </Stack>
  );
}
