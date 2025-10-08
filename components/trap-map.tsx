// components/TrapMap.tsx
"use client";

import { SwarmInput } from "@/lib/schemas/swarmTrap";
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

interface TrapMapProps {
  zoom?: number;
  height?: string;
}

// helper to recenter after traps load
function RecenterOnTraps({ traps }: { traps: SwarmInput[] }) {
  const map = useMap();

  useEffect(() => {
    if (traps.length > 0) {
      const firstTrap = traps[0];
      map.setView([firstTrap.latitude, firstTrap.longitude]);
    }
    // only run when first trap changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, traps[0]?.latitude, traps[0]?.longitude]);

  return null;
}

export default function TrapMap({ zoom = 15, height = "400px" }: TrapMapProps) {
  const [traps, setTraps] = useState<SwarmInput[]>([]);

  useEffect(() => {
    fetch("/api/swarm")
      .then((res) => res.json())
      .then(setTraps)
      .catch((err) => console.error("Error loading traps", err));
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

        {/* Recenter once traps load */}
        <RecenterOnTraps traps={traps} />

        <LayersControl position="topright">
          <BaseLayer checked name="OpenStreetMap">
            <TileLayer
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap contributors"
            />
          </BaseLayer>
          <BaseLayer name="Satellite">
            <TileLayer
              url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
              attribution="© Google"
              subdomains={["mt0", "mt1", "mt2", "mt3"]}
              maxZoom={20}
            />
          </BaseLayer>

          <Overlay checked name="Swarm Traps">
            <LayerGroup>
              {traps.map((trap) => (
                <Marker
                  key={trap.id}
                  position={[trap.latitude, trap.longitude]}
                  icon={honeyIcon}
                >
                  <Popup>
                    <Card className="w-64">
                      <CardHeader>
                        <h5 className="text-base font-semibold">
                          {trap.label || "Unnamed Trap"}
                        </h5>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">
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
