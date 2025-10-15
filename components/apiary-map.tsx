"use client";

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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { IconCalendar, IconInfoCircle, IconMapPin } from "@tabler/icons-react";
import { HiveInput } from "@/lib/schemas/hive";
import { SwarmInput } from "@/lib/schemas/swarmTrap";
import { themedHoneyIcon, themedTrapIcon } from "../Data/mapIcons";

const { BaseLayer, Overlay } = LayersControl;

interface ApiaryMapProps {
  zoom?: number;
  height?: string;
}

function RecenterOnData({
  hives,
  traps,
}: {
  hives: HiveInput[];
  traps: SwarmInput[];
}) {
  const map = useMap();

  useEffect(() => {
    const target = hives[0] || traps[0];
    if (target) {
      map.setView([target.latitude ?? 0, target.longitude ?? 0]);
    }
  }, [map, hives, traps]);

  return null;
}

export default function ApiaryMap({
  zoom = 15,
  height = "500px",
}: ApiaryMapProps) {
  const [hives, setHives] = useState<HiveInput[]>([]);
  const [traps, setTraps] = useState<SwarmInput[]>([]);

  useEffect(() => {
    fetch("/api/hives")
      .then((res) => res.json())
      .then(setHives)
      .catch((err) => console.error("Error loading hives", err));

    fetch("/api/swarm")
      .then((res) => res.json())
      .then(setTraps)
      .catch((err) => console.error("Error loading traps", err));
  }, []);

  return (
    <div style={{ width: "100%", height }}>
      <MapContainer
        center={[42.78851953037975, -83.77241596723684]}
        zoom={zoom}
        zoomControl={false}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <ZoomControl position="bottomright" />
        <RecenterOnData hives={hives} traps={traps} />

        <LayersControl position="topright">
          <BaseLayer checked name="Satellite">
            <TileLayer
              url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
              attribution="© Google"
              subdomains={["mt0", "mt1", "mt2", "mt3"]}
              maxZoom={20}
            />
          </BaseLayer>

          <BaseLayer name="OpenStreetMap">
            <TileLayer
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap contributors"
            />
          </BaseLayer>

          {/* Swarm Traps */}
          <Overlay checked name="Swarm Traps">
            <LayerGroup>
              {traps.map((trap) => (
                <Marker
                  key={`trap-${trap.id}`}
                  position={[trap.latitude, trap.longitude]}
                  icon={themedTrapIcon}
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
                              Installed
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

          {/* Hives */}
          <Overlay checked name="Hives">
            <LayerGroup>
              {hives.map((hive) => (
                <Marker
                  key={`hive-${hive.id}`}
                  position={[hive.latitude ?? 0, hive.longitude ?? 0]}
                  icon={themedHoneyIcon}
                >
                  <Popup className="popup-container">
                    <Card className="w-72 border-0 shadow-none">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <h5 className="text-lg font-semibold">
                            Hive {hive.hiveNumber}
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
                              Established
                            </p>
                            <p className="text-sm font-medium">
                              {new Date(hive.hiveDate).toLocaleDateString(
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

                        {hive.hiveSource && (
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <IconInfoCircle
                                className="h-4 w-4 text-primary"
                                stroke={2}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs text-muted-foreground">
                                Source
                              </p>
                              <p className="text-sm font-medium truncate">
                                {hive.hiveSource}
                              </p>
                            </div>
                          </div>
                        )}

                        {hive.latitude && hive.longitude && (
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <IconMapPin
                                className="h-4 w-4 text-primary"
                                stroke={2}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs text-muted-foreground">
                                Coordinates
                              </p>
                              <p className="text-xs font-mono text-muted-foreground truncate">
                                {hive.latitude.toFixed(5)},{" "}
                                {hive.longitude.toFixed(5)}
                              </p>
                            </div>
                          </div>
                        )}
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
