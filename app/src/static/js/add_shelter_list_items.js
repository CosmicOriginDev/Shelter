const socket = io();

const container = document.getElementById("shelter-list");
const template = document.getElementById("shelter-list-item-template");

// Ask server for shelters
socket.emit("send_shelters");

// Receive full shelter list from server
socket.on("shelter_data", (data) => {
  const shelters = data?.data ?? [];
  console.log("Received shelters:", shelters);

  // Send to controller
  window.dispatchEvent(new CustomEvent("shelters:updated", { detail: shelters }));
});

// Render ONLY the controller-selected shelters
window.addEventListener("shelters:display", (e) => {
  const sheltersToShow = e.detail || [];
  container.innerHTML = "";

  sheltersToShow.forEach((shelter) => {
    const clone = template.content.cloneNode(true);

    clone.querySelector(".name").textContent =
      `${shelter.displayNumber}. ${shelter.name ?? "(no name)"}`;

    const occ = shelter.current_population ?? shelter.occupied ?? "?";
    const max = shelter.max_people ?? shelter.capacity ?? "?";
    clone.querySelector(".capacity").textContent = `Beds available: ${occ} / ${max}`;

    const linkEl = clone.querySelector(".map-link");
    if (linkEl) {
      linkEl.href = shelter.map_link ?? "#";
      linkEl.target = "_blank";
      linkEl.rel = "noopener noreferrer";
    }

    container.appendChild(clone);
  });
});