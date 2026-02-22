import './shelter-pin.js';
import { addPin } from './addPins.js';
import { setOccupied } from './editCapacity.js';
import { getLocation } from './getLocation.js';

//Load map
const map = L.map('map').setView([38.6270, -90.1994], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
}).addTo(map);

const area = document.getElementById('pinArea');

getLocation((lat, lng) => {
    console.log("User at:", lat, lng);
});

//Pin JS
function pinHtml({ number, occupied, capacity }) {
    const percent = capacity > 0 ? Math.round((occupied / capacity) * 100) : 0;
  
    return `
      <div class="pin">
        <button class="progress-ring" type="button" style="--percent:${percent}">
          <span>${number}</span>
        </button>
      </div>
    `;
  }
  
  function addShelterMarker(map, shelter) {
    const icon = L.divIcon({
      className: '',                 // prevents Leaflet default styles
      html: pinHtml(shelter),
      iconSize: [80, 98],            // approximate size including tip
      iconAnchor: [40, 98],          // bottom middle is the “point”
    });
  
    const marker = L.marker([shelter.lat, shelter.lng], { icon }).addTo(map);
  
    // Make it navigable on click
    marker.on('click', () => {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${shelter.lat},${shelter.lng}`,
        '_blank'
      );
    });
  
    return marker;
  }

//Manual add shelter pins:
const shelters = [
    { id: "a", number: 1, occupied: 65, capacity: 100, lat: 38.6270, lng: -90.1994 },
    { id: "b", number: 2, occupied: 10, capacity: 80,  lat: 38.6320, lng: -90.2100 },
  ];
  
  const markersById = new Map();
  for (const s of shelters) {
    markersById.set(s.id, addShelterMarker(map, s));
  }

//Update shelter marker function
function updateShelterMarker(marker, shelter) {
    const icon = L.divIcon({
      className: '',
      html: pinHtml(shelter),
      iconSize: [80, 98],
      iconAnchor: [40, 98],
    });
    marker.setIcon(icon);
  }

//Manual update shelter markers
const shelterA = shelters[0];
shelterA.occupied = 90;
updateShelterMarker(markersById.get("a"), shelterA);