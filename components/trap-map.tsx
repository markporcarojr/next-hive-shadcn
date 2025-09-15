// components/TrapMap.tsx
"use client";

import { SwarmInput } from "@/lib/schemas/swarmTrap";
import { Card, Text, Title } from "@mantine/core";
import { useEffect, useState } from "react";
import {
  LayerGroup,
  LayersControl,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  ZoomControl,
} from "react-leaflet";
import { honeyIcon } from "../data/mapIcons";

const { BaseLayer, Overlay } = LayersControl;

interface TrapMapProps {
  zoom?: number;
  height?: string;
}

export default function TrapMap({ zoom = 15, height = "400px" }: TrapMapProps) {
  const [traps, setTraps] = useState<SwarmInput[]>([]);

  useEffect(() => {
    fetch("/api/swarm")
      .then((res) => res.json())
      .then(setTraps)
      .catch((err) => console.error("Error loading traps", err));
  }, []);

  const center: [number, number] =
    traps.length > 0
      ? [traps[0].latitude, traps[0].longitude]
      : [42.78, -83.77];

  return (
    <div style={{ width: "100%", height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        zoomControl={true}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <ZoomControl position="bottomright" />

        <LayersControl position="topright">
          <BaseLayer checked name="OpenStreetMap">
            <TileLayer
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap contributors"
            />
          </BaseLayer>

          <Overlay checked name="Swarm Traps">
            <LayerGroup>
              {traps &&
                traps.length > 0 &&
                traps.map((trap) => (
                  <Marker
                    key={trap.id}
                    position={[trap.latitude, trap.longitude]}
                    icon={honeyIcon}
                  >
                    <Popup>
                      <Card shadow="xs" padding="sm">
                        <Title order={5}>{trap.label || "Unnamed Trap"}</Title>
                        <Text size="sm">
                          Trap Set:{" "}
                          {
                            new Date(trap.installedAt)
                              .toISOString()
                              .split("T")[0]
                          }
                        </Text>
                        <Text size="sm" c="dimmed">
                          Label: {trap.label}
                        </Text>
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
