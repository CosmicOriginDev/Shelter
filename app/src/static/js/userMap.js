import { getLocation } from './getLocation.js';

// 1) Create map
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

// 2) Marker store
const markersById = new Map();

// 3) Build pin HTML (adjust keys to your shelter object)
function pinHtml(shelter) {
  const number = shelter.number ?? ''; // or shelter.id, or your list index
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

function upsertShelterMarker(shelter) {
  // Use latitude/longitude as you said
  const lat = Number(shelter.latitude);
  const lng = Number(shelter.longitude);

  // Skip bad data safely
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

  const icon = L.divIcon({
    className: '',
    html: pinHtml(shelter),
    iconSize: [80, 98],
    iconAnchor: [40, 98],
  });

  const id = shelter.id ?? `${lat},${lng}`; // fallback id if needed

  let marker = markersById.get(id);
  if (!marker) {
    marker = L.marker([lat, lng], { icon }).addTo(map);

    marker.on('click', () => {
      // Prefer map_link if present
      const url = shelter.map_link
        ? shelter.map_link
        : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

      window.open(url, '_blank');
    });

    markersById.set(id, marker);
  } else {
    marker.setLatLng([lat, lng]);
    marker.setIcon(icon);
  }
}

// 4) Receive shelters from the list module
window.addEventListener('shelters:updated', (e) => {
  const shelters = e.detail;
  if (!Array.isArray(shelters)) return;

  shelters.forEach(upsertShelterMarker);
});