"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Target } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import { honeyIcon } from "../Data/mapIcons";

type MapPickerProps = {
  initialLat?: number;
  initialLng?: number;
  onSelect: (_lat: number, _lng: number, _address?: string) => void;
};

function LocationMarker({
  onSelect,
  selectedPosition,
}: {
  onSelect: (_lat: number, _lng: number, _address?: string) => void;
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
        Lat: {selectedPosition.lat.toFixed(4)}, Lng:{" "}
        {selectedPosition.lng.toFixed(4)}
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
  const inputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<L.Map>(null);

  useEffect(() => {
    const initAutocomplete = () => {
      if (!inputRef.current || !window.google) return;

      const autocomplete = new google.maps.places.Autocomplete(
        inputRef.current,
        {
          fields: ["geometry", "formatted_address"],
          types: ["geocode"], // only addresses
        }
      );

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) return;

        const lat = place.geometry.location?.lat();
        const lng = place.geometry.location?.lng();
        if (lat && lng) {
          const newPos = new L.LatLng(lat, lng);
          setPosition(newPos);
          onSelect(lat, lng, place.formatted_address);
          mapRef.current?.setView(newPos, 15);
        }
      });
    };

    // Google script already in <head> via layout.tsx
    if (typeof window !== "undefined" && window.google) {
      initAutocomplete();
    } else {
      // If script might load late, listen for it
      const handleLoad = () => initAutocomplete();
      window.addEventListener("google-maps-loaded", handleLoad);
      return () => window.removeEventListener("google-maps-loaded", handleLoad);
    }
  }, [onSelect]);

  const handleUseCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = pos.coords;
        const newPos = new L.LatLng(coords.latitude, coords.longitude);
        setPosition(newPos);
        onSelect(newPos.lat, newPos.lng, "Current Location");
        mapRef.current?.setView(newPos, 15);
      },
      () => alert("Could not access location")
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          placeholder="Search for address"
          className="flex-1"
        />
        <Button variant="outline" onClick={handleUseCurrentLocation}>
          <Target className="h-4 w-4 mr-2" />
          Current
        </Button>
      </div>

      <MapContainer
        center={[initialLat, initialLng]}
        zoom={13}
        style={{ height: "400px", width: "100%" }}
        ref={(ref) => {
          if (ref && !mapRef.current) mapRef.current = ref;
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
        <LocationMarker onSelect={onSelect} selectedPosition={position} />
      </MapContainer>
    </div>
  );
}
