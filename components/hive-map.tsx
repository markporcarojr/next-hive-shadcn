// components/HiveMap.tsx
"use client";

import { HiveInput } from "@/lib/schemas/hive";
import { useEffect, useState } from "react";
import {
  LayerGroup,
  LayersControl,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  ZoomControl,
  useMap,
} from "react-leaflet";
import { honeyIcon } from "../Data/mapIcons";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const { BaseLayer, Overlay } = LayersControl;

interface HiveMapProps {
  zoom?: number;
  height?: string;
}

// helper to recenter after Hives load
function RecenterOnHives({ hives }: { hives: HiveInput[] }) {
  const map = useMap();

  useEffect(() => {
    if (hives.length > 0) {
      const firstHive = hives[0];
      map.setView([firstHive.latitude ?? 0, firstHive.longitude ?? 0]);
    }
    // only run when first Hive changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, hives[0]?.latitude, hives[0]?.longitude]);

  return null;
}

export default function HiveMap({ zoom = 15, height = "400px" }: HiveMapProps) {
  const [hives, setHives] = useState<HiveInput[]>([]);

  useEffect(() => {
    fetch("/api/hives")
      .then((res) => res.json())
      .then(setHives)
      .catch((err) => console.error("Error loading Hives", err));
  }, []);

  return (
    <div style={{ width: "100%", height }}>
      <MapContainer
        center={[42.78851953037975, -83.77241596723684]} // fallback
        zoom={zoom}
        zoomControl={true}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <ZoomControl position="bottomright" />

        {/* Recenter once Hives load */}
        <RecenterOnHives hives={hives} />

        <LayersControl position="topright">
          <BaseLayer name="OpenStreetMap">
            <TileLayer
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap contributors"
            />
          </BaseLayer>
          <BaseLayer checked name="Satellite">
            <TileLayer
              url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
              attribution="© Google"
              subdomains={["mt0", "mt1", "mt2", "mt3"]}
              maxZoom={20}
            />
          </BaseLayer>

          <Overlay checked name="Swarm Hives">
            <LayerGroup>
              {hives.map((hive) => (
                <Marker
                  key={hive.id}
                  position={[hive.latitude ?? 0, hive.longitude ?? 0]}
                  icon={honeyIcon}
                >
                  <Popup>
                    <Card className="w-64">
                      <CardHeader>
                        <h5 className="text-base font-semibold">
                          {hive.hiveNumber || "Unnamed Hive"}
                        </h5>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">
                          Hive Set:{" "}
                          {new Date(hive.hiveDate).toISOString().split("T")[0]}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Source: {hive.hiveSource || "N/A"}
                        </p>
                      </CardContent>
                    </Card>
                  </Popup>
                </Marker>
              ))}
            </LayerGroup>
          </Overlay>
        </LayersControl>
      </MapContainer>
    </div>
  );
}
