"use client";

import { useEffect, useState } from "react";
import type { MarkerIcon } from "../Data/mapIcons";
import { getMapIcons } from "../Data/mapIcons";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  LayersControl,
  LayerGroup,
} from "react-leaflet";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import { HiveInput } from "@/lib/schemas/hive";
import { SwarmInput } from "@/lib/schemas/swarmTrap";
import { IconCalendar, IconInfoCircle } from "@tabler/icons-react";
import "leaflet/dist/leaflet.css";
import "leaflet-gesture-handling/dist/leaflet-gesture-handling.css";

const { BaseLayer, Overlay } = LayersControl;

export default function ApiaryMap({
  zoom = 15,
  height = "500px",
}: {
  zoom?: number;
  height?: string;
}) {
  const [hives, setHives] = useState<HiveInput[]>([]);
  const [traps, setTraps] = useState<SwarmInput[]>([]);
  const [selectedHive, setSelectedHive] = useState<string>("all");
  const [selectedTrap, setSelectedTrap] = useState<string>("all");
  const [icons, setIcons] = useState<{
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
    const loadData = async () => {
      try {
        const [hivesRes, trapsRes] = await Promise.all([
          fetch("/api/hives"),
          fetch("/api/swarm"),
        ]);
        if (!hivesRes.ok || !trapsRes.ok)
          throw new Error("Failed to load data");

        const [hivesData, trapsData] = await Promise.all([
          hivesRes.json(),
          trapsRes.json(),
        ]);
        setHives(hivesData);
        setTraps(trapsData);
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };
    loadData();
  }, []);

  // Filtered arrays
  const filteredHives =
    selectedHive === "all"
      ? hives
      : hives.filter((h) => h.id === Number(selectedHive));

  const filteredTraps =
    selectedTrap === "all"
      ? traps
      : traps.filter((t) => t.id === Number(selectedTrap));

  return (
    <div className="space-y-3">
      {/* Filter Dropdowns */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="w-48">
          <Select value={selectedHive} onValueChange={setSelectedHive}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Hive" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Hives</SelectItem>
              {hives.map((hive) => (
                <SelectItem key={hive.id} value={hive.id?.toString() || ""}>
                  Hive #{hive.hiveNumber}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-48">
          <Select value={selectedTrap} onValueChange={setSelectedTrap}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Trap" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Traps</SelectItem>
              {traps.map((trap) => (
                <SelectItem key={trap.id} value={trap.id?.toString() || ""}>
                  {trap.label || `Trap #${trap.id}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Map */}
      <div style={{ width: "100%", height }}>
        <MapContainer
          center={[42.78851953037975, -83.77241596723684]}
          zoom={zoom}
          scrollWheelZoom={false}
          // @ts-expect-error leaflet-gesture-handling prop not in react-leaflet types
          gestureHandling={true}
          className="z-0 w-full h-full"
        >
          <LayersControl position="topright">
            <BaseLayer checked name="Satellite">
              <TileLayer
                url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                subdomains={["mt0", "mt1", "mt2", "mt3"]}
                attribution="© Google"
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
                {icons && filteredTraps.map((trap) => (
                  <Marker
                    key={`trap-${trap.id}`}
                    position={[trap.latitude, trap.longitude]}
                    icon={icons.themedTrapIcon}
                  >

                    <Popup>
                      <Card className="w-72 border-0 shadow-none">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between">
                            <h5 className="text-lg font-semibold">
                              {trap.label || "Unnamed Trap"}
                            </h5>
                            <span className="text-xs bg-primary/10 px-2 py-1 rounded-full text-primary">
                              Active
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                              <IconCalendar className="h-4 w-4 text-primary" />
                            </div>
                            <div>
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
                {icons && filteredHives.map((hive) => (
                  <Marker
                    key={`hive-${hive.id}`}
                    position={[hive.latitude ?? 0, hive.longitude ?? 0]}
                    icon={icons.themedHoneyIcon}
                  >
                    <Popup>
                      <Card className="w-72 border-0 shadow-none">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between">
                            <h5 className="text-lg font-semibold">
                              Hive #{hive.hiveNumber}
                            </h5>
                            <span className="text-xs bg-primary/10 px-2 py-1 rounded-full text-primary">
                              Active
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                              <IconCalendar className="h-4 w-4 text-primary" />
                            </div>
                            <div>
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
                              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                                <IconInfoCircle className="h-4 w-4 text-primary" />
                              </div>
                              <div>
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
    </div>
  );
}
