// components/TrapMap.tsx
"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SwarmInput } from "@/lib/schemas/swarmTrap";
import { IconCalendar } from "@tabler/icons-react";
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
import { themedHoneyIcon } from "../Data/mapIcons";

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

          <Overlay checked name="Swarm Traps">
            <LayerGroup>
              {traps.map((trap) => (
                <Marker
                  key={trap.id}
                  position={[trap.latitude, trap.longitude]}
                  icon={themedHoneyIcon}
                >
                  <Popup className="popup-container">
                    <Card className="w-72 border-0 shadow-none">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <h5 className="text-lg font-semibold">
                            {trap.label || "Unnamed Trap"}
                          </h5>
                          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
                            Active
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <IconCalendar
                              className="h-4 w-4 text-primary"
                              stroke={2}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">
                              Date Set
                            </p>
                            <p className="text-sm font-medium">
                              {new Date(trap.installedAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </p>
                          </div>
                        </div>
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
