const socket = io();

const container = document.getElementById("shelter-list");
const template = document.getElementById("shelter-list-item-template");

// Ask server for shelters
socket.emit("send_shelters");

window.addEventListener("shelter_data_changed", (e) => {
  socket.emit("send_shelters");
});

// Receive full shelter list from server
socket.on("shelter_data", (data) => {
  const shelters = data?.data ?? [];
  console.log("Received shelters:", shelters);

  // Send to controller
  window.dispatchEvent(new CustomEvent("shelters:updated", { detail: shelters }));
});

function setSelectedCard(id) {
  const cards = container.querySelectorAll(".shelter-list-item-template");
  cards.forEach((card) => {
    card.classList.toggle("is-selected", card.dataset.shelterId === String(id));
  });
}

// Render ONLY the controller-selected shelters
window.addEventListener("shelters:display", (e) => {
  const sheltersToShow = e.detail || [];
  container.innerHTML = "";

  sheltersToShow.forEach((shelter) => {
    const clone = template.content.cloneNode(true);
    const cardEl = clone.querySelector(".shelter-list-item-template");
    const shelterId = shelter.id ?? `${shelter.latitude},${shelter.longitude}`;

    const occupiedNum = Number(shelter.current_population ?? shelter.occupied ?? 0);
    const capacityNum = Number(shelter.max_people ?? shelter.capacity ?? 0);
    const percent = capacityNum > 0 ? Math.round((occupiedNum / capacityNum) * 100) : 0;
    let pinColor = "#4CAF50";
    if (capacityNum > 0 && occupiedNum >= capacityNum) {
      pinColor = "#E53935";
    } else if (percent >= 80) {
      pinColor = "#FB8C00";
    }

    const nameEl = clone.querySelector(".name");
    nameEl.innerHTML = `
      <span class="mini-progress-ring" style="--percent:${percent}; --pin-color:${pinColor}">
        <span>${shelter.displayNumber ?? ""}</span>
      </span>
      <span class="name-text">${shelter.name ?? "(no name)"}</span>
    `;

    const occ = shelter.current_population ?? shelter.occupied ?? "?";
    const max = shelter.max_people ?? shelter.capacity ?? "?";
    clone.querySelector(".capacity").textContent = `Beds available: ${occ} / ${max}`;

    const linkEl = clone.querySelector(".map-link");
    if (linkEl) {
      const lat = Number(shelter.latitude);
      const lng = Number(shelter.longitude);
      const fallbackMapUrl =
        Number.isFinite(lat) && Number.isFinite(lng)
          ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
          : "#";
      linkEl.href = shelter.map_link ?? fallbackMapUrl;
      linkEl.target = "_blank";
      linkEl.rel = "noopener noreferrer";
    }

    if (cardEl) {
      cardEl.dataset.shelterId = String(shelterId);
      cardEl.addEventListener("click", (event) => {
        if (event.target.closest(".map-link")) return;
        setSelectedCard(shelterId);
        window.dispatchEvent(new CustomEvent("shelter:focus", { detail: shelter }));
      });
    }

    container.appendChild(clone);
  });
});