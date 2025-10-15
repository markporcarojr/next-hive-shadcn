import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Keep your original icon as fallback
export const honeyIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Theme-aware custom marker
export const themedHoneyIcon = L.divIcon({
  className: "custom-honey-marker",
  html: `
    <div class="marker-pin">
      <div class="marker-icon">🐝</div>
    </div>
    <div class="marker-shadow"></div>
  `,
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -42],
});

export const themedTrapIcon = L.divIcon({
  className: "custom-honey-marker",
  html: `
    <div class="marker-pin">
      <div class="marker-icon">🪤</div>
    </div>
    <div class="marker-shadow"></div>
  `,
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -42],
});
