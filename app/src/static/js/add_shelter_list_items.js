// app/static/js/add_shelter_list_items.js
// Receives shelter list over Socket.IO, renders the list, then notifies the map once.

const socket = io();
let shelters = [];

// DOM references
const container = document.getElementById("shelter-list");
const template = document.getElementById("shelter-list-item-template");

// Ask the server for shelters as soon as this script loads
socket.emit("send_shelters");

// Receive shelters
socket.on("shelter_data", (data) => {
  console.log("Received shelters:", data);

  shelters = data?.data ?? [];
  if (!Array.isArray(shelters)) shelters = [];

  // Clear old list so updates don't duplicate
  container.innerHTML = "";

  // Render list items
  shelters.forEach((shelter) => {
    const clone = template.content.cloneNode(true);

    // Required fields
    const nameEl = clone.querySelector(".name");
    if (nameEl) nameEl.textContent = shelter.name ?? "(no name)";

    const capEl = clone.querySelector(".capacity");
    if (capEl) {
      const occ = shelter.current_population ?? shelter.occupied ?? "?";
      const max = shelter.max_people ?? shelter.capacity ?? "?";
      capEl.textContent = `Beds available: ${occ} / ${max}`;
    }

    // Map link button (optional)
    const linkEl = clone.querySelector(".map-link");
    if (linkEl) {
      // If your backend sends a full Google Maps URL, use it
      linkEl.href = shelter.map_link ?? "#";
      linkEl.target = "_blank";
      linkEl.rel = "noopener noreferrer";
    }

    // Optional display of latitude/longitude if your template has these elements
    const latEl = clone.querySelector(".latitude");
    if (latEl && shelter.latitude != null) latEl.textContent = String(shelter.latitude);

    const lngEl = clone.querySelector(".longitude");
    if (lngEl && shelter.longitude != null) lngEl.textContent = String(shelter.longitude);

    container.appendChild(clone);
  });

  // Notify the map module once per full update
  window.dispatchEvent(
    new CustomEvent("shelters:updated", {
      detail: shelters
    })
  );
});