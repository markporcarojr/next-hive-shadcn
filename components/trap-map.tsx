// components/TrapMap.tsx
"use client";

import { SwarmInput } from "@/lib/schemas/swarmTrap";
import { Card, CardContent } from "@/components/ui/card";
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
import { honeyIcon } from "../Data/mapIcons";

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
                      <Card className="shadow-sm">
                        <CardContent className="p-3">
                          <h5 className="font-medium text-sm mb-1">{trap.label || "Unnamed Trap"}</h5>
                          <p className="text-sm text-muted-foreground">
                            Trap Set:{" "}
                            {
                              new Date(trap.installedAt)
                                .toISOString()
                                .split("T")[0]
                            }
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Label: {trap.label}
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
