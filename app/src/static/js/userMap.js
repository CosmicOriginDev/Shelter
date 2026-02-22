import { getLocation } from './getLocation.js';

const map = L.map('map', {
  zoomAnimation: false,
  fadeAnimation: false,
  markerZoomAnimation: false,
}).setView([38.6270, -90.1994], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

// Optional: center on user
getLocation((lat, lng) => {
  map.setView([lat, lng], 14);
});

const markersById = new Map();

function pinHtml(shelter) {
  const number = shelter.displayNumber ?? '';
  const occupied = Number(shelter.current_population ?? shelter.occupied ?? 0);
  const capacity = Number(shelter.max_people ?? shelter.capacity ?? 0);
  const percent = capacity > 0 ? Math.round((occupied / capacity) * 100) : 0;
  let pinColor = "#22c55e";
  if (capacity > 0 && occupied >= capacity) {
    pinColor = "#ef4444";
  } else if (percent >= 80) {
    pinColor = "#f59e0b";
  }

  return `
    <div class="pin" style="--pin-color:${pinColor}">
      <button class="progress-ring" type="button" style="--percent:${percent}; --pin-color:${pinColor}">
        <span>${number}</span>
      </button>
    </div>
  `;
}

function clearMarkers() {
  for (const m of markersById.values()) m.remove();
  markersById.clear();
}

function addMarker(shelter) {
  const lat = Number(shelter.latitude);
  const lng = Number(shelter.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
  const shelterId = shelter.id ?? `${lat},${lng}`;

  const icon = L.divIcon({
    className: '',
    html: pinHtml(shelter),
    iconSize: [80, 98],
    iconAnchor: [40, 98],
  });

  const marker = L.marker([lat, lng], { icon }).addTo(map);

  // Keep #1 on top, #2 below, etc.
  marker.setZIndexOffset(1000 - (shelter.displayNumber ?? 0));

  const occ = shelter.current_population ?? shelter.occupied ?? "?";
  const max = shelter.max_people ?? shelter.capacity ?? "?";
  const goUrl = shelter.map_link
    ? shelter.map_link
    : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  marker.bindPopup(`
    <div style="min-width: 180px; line-height: 1.35;">
      <strong>${shelter.name ?? "Shelter"}</strong><br/>
      Beds available: ${occ} / ${max}<br/>
      <a href="${goUrl}" target="_blank" rel="noopener noreferrer">GO</a>
    </div>
  `);

  markersById.set(shelterId, marker);
}

window.addEventListener('shelters:display', (e) => {
  const shelters = e.detail || [];
  clearMarkers();
  shelters.forEach(addMarker);
});

window.addEventListener('shelter:focus', (e) => {
  const shelter = e.detail;
  if (!shelter) return;
  const marker = markersById.get(shelter.id ?? `${shelter.latitude},${shelter.longitude}`);
  if (!marker) return;

  const currentZoom = map.getZoom();
  const targetZoom = Math.max(currentZoom, 16);
  marker.setZIndexOffset(5000);

  map.once('moveend', () => {
    setTimeout(() => {
      marker.setZIndexOffset(1000 - (shelter.displayNumber ?? 0));
    }, 900);
  });

  map.flyTo(marker.getLatLng(), targetZoom, {
    animate: true,
    duration: 1.1,
    easeLinearity: 0.25,
  });
});

// Keep Leaflet rendering correct when viewport size changes on mobile.
window.addEventListener('resize', () => {
  map.invalidateSize();
});