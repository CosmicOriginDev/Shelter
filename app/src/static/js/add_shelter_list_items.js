const socket = io();
var shelters = [];

const container = document.getElementById("shelter-list");
const template = document.getElementById("shelter-list-item-template");


socket.emit('send_shelters')

socket.on("shelter_data", (data) => {
  console.log("Received shelters:", data);
  shelters.push(data);
  shelters.forEach(shelter => {
    const clone = template.content.cloneNode(true);
  
    clone.querySelector(".name").textContent = shelter.data.name;
    clone.querySelector(".capacity").textContent = `Beds available: ${shelter.data.current_population} / ${shelter.data.capacity}`;
    clone.querySelector(".map-link").href = shelter.data.map_link;
  
    container.appendChild(clone);
  });
});





socket.on("shelters_ready", (data) => {
 
});


