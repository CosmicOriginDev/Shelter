const socket = io();
var shelters = [];

const container = document.getElementById("shelter-list");
const template = document.getElementById("shelter-list-item-template");


socket.emit('send_shelters')

socket.on("shelter_data", (data) => {
  console.log("Received shelters:", data);
  var new_data = JSON.parse(data);
  shelters.push(new_data);
  shelters.forEach(shelter => {
    const clone = template.content.cloneNode(true);
  
    clone.querySelector(".name").textContent = shelter.name;
    clone.querySelector(".capacity").textContent = `Capacity: ${shelter.capacity}`;
    clone.querySelector(".map-link").href = shelter.map_link;
  
    container.appendChild(clone);
  });
});





socket.on("shelters_ready", (data) => {
 
});


