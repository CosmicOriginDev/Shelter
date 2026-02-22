import './shelter-pin.js';
import './userMap.js';
import './add_shelter_list_items.js';

import { getLocation } from './getLocation.js';
import { getNearestN } from './nearestShelters.js';

let DISPLAY_N = 2;
let userLat = null;
let userLng = null;
let lastShelters = [];

window.setDisplayN = (n) => {
  DISPLAY_N = Math.max(1, Number(n) || 1);
  recomputeAndDispatch();
};

function recomputeAndDispatch() {
  if (!Array.isArray(lastShelters) || lastShelters.length === 0) return;

  // If location isn't ready, fall back to first N so the UI isn't empty
  let subset;
  if (userLat == null || userLng == null) {
    subset = lastShelters.slice(0, DISPLAY_N);
  } else {
    subset = getNearestN(lastShelters, userLat, userLng, DISPLAY_N);
  }

  const withNumbers = subset.map((s, i) => ({
    ...s,
    displayNumber: i + 1
  }));

  window.dispatchEvent(new CustomEvent('shelters:display', { detail: withNumbers }));
}

getLocation((lat, lng) => {
  userLat = lat;
  userLng = lng;
  recomputeAndDispatch();
});

window.addEventListener('shelters:updated', (e) => {
  lastShelters = e.detail || [];
  recomputeAndDispatch();
});

console.log('app_ui controller loaded');