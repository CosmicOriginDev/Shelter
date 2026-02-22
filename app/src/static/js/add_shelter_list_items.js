
const shelters = [
    { name: "Shelter A", capacity: 120, map_link: "https://maps.google.com/?q=A" },
    { name: "Shelter B", capacity: 80,  map_link: "https://maps.google.com/?q=B" },
    { name: "Shelter C", capacity: 200, map_link: "https://maps.google.com/?q=C" }
  ];

const container = document.getElementById("shelter-list");
const template = document.getElementById("shelter-list-item-template");

shelters.forEach(shelter => {
  const clone = template.content.cloneNode(true);

  clone.querySelector(".name").textContent = shelter.name;
  clone.querySelector(".capacity").textContent = `Capacity: ${shelter.capacity}`;
  clone.querySelector(".map-link").href = shelter.map_link;

  container.appendChild(clone);
});