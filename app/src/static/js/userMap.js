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

  return `
    <div class="pin">
      <button class="progress-ring" type="button" style="--percent:${percent}">
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

  const icon = L.divIcon({
    className: '',
    html: pinHtml(shelter),
    iconSize: [80, 98],
    iconAnchor: [40, 98],
  });

  const marker = L.marker([lat, lng], { icon }).addTo(map);

  // Keep #1 on top, #2 below, etc.
  marker.setZIndexOffset(1000 - (shelter.displayNumber ?? 0));

  marker.on('click', () => {
    const url = shelter.map_link
      ? shelter.map_link
      : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, "_blank");
  });

  markersById.set(shelter.id ?? `${lat},${lng}`, marker);
}

window.addEventListener('shelters:display', (e) => {
  const shelters = e.detail || [];
  clearMarkers();
  shelters.forEach(addMarker);
});