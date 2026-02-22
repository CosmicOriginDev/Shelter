import './add_shelter_list_items.js';
import './shelter-pin.js';
import './userMap.js';

import { getLocation } from './getLocation.js';
import { getNearestN } from './nearestShelters.js';

// Socket.IO bridge: server `shelter_data` -> UI `shelters:updated`
const socket = window.io();

socket.on('connect', () => {
  console.log('socket connected:', socket.id);
  socket.emit('send_shelters');
});

socket.on('shelter_data', (payload) => {
  const shelters = payload?.data ?? [];
  window.dispatchEvent(new CustomEvent('shelters:updated', { detail: shelters }));
});

socket.on('connect_error', (err) => {
  console.error('socket connect_error:', err.message);
});

let DISPLAY_N = 2;          // <-- later you’ll change this from UI
let userLat = null;
let userLng = null;
let lastShelters = [];

// optional: make it adjustable later from console or a UI control
window.setDisplayN = (n) => {
  DISPLAY_N = Math.max(1, Number(n) || 1);
  recomputeAndDispatch();
};

function recomputeAndDispatch() {
  if (userLat == null || userLng == null) return;
  if (!Array.isArray(lastShelters)) return;

  const nearest = getNearestN(lastShelters, userLat, userLng, DISPLAY_N);

  // assign displayNumber 1..N so map + list match
  const withNumbers = nearest.map((s, i) => ({
    ...s,
    displayNumber: i + 1
  }));

  window.dispatchEvent(
    new CustomEvent('shelters:display', { detail: withNumbers })
  );
}

// Get user location once at startup
getLocation((lat, lng) => {
  userLat = lat;
  userLng = lng;
  recomputeAndDispatch();
});

// Receive full shelter list from Socket.IO module
window.addEventListener('shelters:updated', (e) => {
  lastShelters = e.detail || [];
  recomputeAndDispatch();
});

console.log('app_ui controller loaded');