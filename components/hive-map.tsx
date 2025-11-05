// components/HiveMap.tsx
"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { HiveInput } from "@/lib/schemas/hive";
import { IconCalendar, IconInfoCircle } from "@tabler/icons-react";
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
import L from "leaflet";

import { themedHoneyIcon } from "../Data/mapIcons";
import { GestureHandling } from "leaflet-gesture-handling";
import "leaflet/dist/leaflet.css";
import "leaflet-gesture-handling/dist/leaflet-gesture-handling.css";

// Register the gesture handling plugin globally
L.Map.addInitHook("addHandler", "gestureHandling", GestureHandling);

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
        // @ts-expect-error leaflet-gesture-handling prop not in react-leaflet types
        gestureHandling={true} // <-- this activates two-finger gesture handling
        className="z-0"
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
                  icon={themedHoneyIcon}
                >
                  {/* // In your HiveMap component, replace the Popup section: */}
                  <Popup className="popup-container">
                    <Card className="w-72 border-0 shadow-none">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <h5 className="text-lg font-semibold">
                            Hive #{hive.hiveNumber || "Unnamed Hive"}
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
